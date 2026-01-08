import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { bloomSystemPrompt, buildUserContext, handlePotentialCrisis } from '@/lib/bloom';

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 1. Check Auth & Dev Bypass
  let {
    data: { user },
  } = await supabase.auth.getUser();

  let dbClient = supabase;
  let userProfile: any = null;
  let userId = user?.id;

  if (!userId) {
      // Dev bypass - same pattern as conversations route
      userId = 'fd998a0a-e068-4fef-af1a-d10267318f9b';
      dbClient = createAdminClient();
  }

  // Fetch actual profile
  const { data: profile } = await dbClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  const { data: items } = await dbClient
    .from('user_items')
    .select('*, items(*)')
    .eq('user_id', userId);
    
  userProfile = {
      ...profile,
      unlocked_items: items?.map((i: any) => i.items.name) || []
  };


  try {
    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]; // User's latest message

    // 2. Crisis Detection (Always First)
    const crisisCheck = await handlePotentialCrisis(lastMessage.content, userId);
    if (crisisCheck.skipNormalProcessing && crisisCheck.response) {
      // Save user message and crisis response
      if (conversationId) {
        await dbClient.from('messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: lastMessage.content
        });
        await dbClient.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: crisisCheck.response
        });
      }
      
      // Return crisis response immediately (not streamed)
      return NextResponse.json({ 
        response: crisisCheck.response, 
        isCrisis: true 
      });
    }

    // 3. Persist User Message
    if (conversationId) {
         const { error: insertError } = await dbClient.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: lastMessage.content
         });
         
         if (insertError) {
             console.error("Error saving user message:", insertError);
         }
    }


    // 3. Format History for Gemini
    // Gemini SDK expects history in a specific format if using chat.sendMessageStream
    // or we can just pass contents if using generateContentStream.
    // Let's use chat.completions style logic or native sdk logic.
    // Native SDK: history is [{ role: 'user' | 'model', parts: [{ text: string }] }]

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user', // Map 'assistant' -> 'model'
      parts: [{ text: m.content }],
    }));

    // 4. Build Dynamic User Context
    const userContext = buildUserContext(userProfile, { 
      messageCount: history.length 
    });

    // 5. Construct Full System Instruction (Bloom + Context)
    const fullSystemInstruction = bloomSystemPrompt + userContext;

    // 6. Initialize Chat (Standard Pattern)
    // Using gemini-2.5-flash as it is available in this environment
    const model = client.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: fullSystemInstruction 
    });

    const chat = model.startChat({
      history: history,
    });

    // 6. Stream Response
    console.log("Sending message to Gemini...");
    const result = await chat.sendMessageStream(lastMessage.content);
    console.log("Gemini response stream started");
    
    // Create a generic stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          
          // 7. Persist AI Response (After stream completion)
          if (conversationId && fullResponse) {
             await dbClient.from('messages').insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: fullResponse
             });
             

             // 8. Award XP & Level (Atomic RPC)
             const xpPerMessage = 10;
             const { error: rpcError } = await dbClient.rpc('increment_user_stats', {
                 user_id: userId,
                 xp_delta: xpPerMessage,
                 messages_delta: 1
             });
             
             if (rpcError) {
                console.error("Error incrementing user stats:", rpcError);
             }

             // 9. Daily Check-in & Points
             const today = new Date().toISOString().split('T')[0];
             let pointsToAdd = 0;
             let newStreak = userProfile?.current_streak || 0;
             let lastActiveDate = userProfile?.last_active_date;

             // Daily Check-in Logic
             if (userProfile && lastActiveDate !== today) {
                 if (lastActiveDate) {
                     const lastActive = new Date(lastActiveDate);
                     const yesterday = new Date();
                     yesterday.setDate(yesterday.getDate() - 1);
                     
                     const isYesterday = lastActive.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
                     
                     if (isYesterday) {
                         newStreak += 1;
                     } else {
                        // Loose reset logic as per MVP requirements
                        if (!isYesterday) newStreak = 1; 
                     }
                 } else {
                    newStreak = 1;
                 }
                 
                 pointsToAdd = 10;
                 lastActiveDate = today;
                 
                 // Log activity for check-in
                 await dbClient.from('activity_log').insert({
                     user_id: userId,
                     activity_type: 'daily_check_in',
                     points_earned: pointsToAdd
                 });
             }

             // Update Profile for Daily Check-in only (Points, Streak, Date)
             if (pointsToAdd > 0 || lastActiveDate !== userProfile?.last_active_date) {
                 const updates: any = {
                     ...(lastActiveDate !== userProfile?.last_active_date && { last_active_date: lastActiveDate }),
                     ...(newStreak !== userProfile?.current_streak && { current_streak: newStreak }),
                     ...(pointsToAdd > 0 && { 
                         total_points: (userProfile?.total_points || 0) + pointsToAdd,
                         current_points: (userProfile?.current_points || 0) + pointsToAdd 
                     })
                 };

                 const { error: updateError } = await dbClient.from('profiles').update(updates).eq('id', userId);
                     
                 if (updateError) {
                     console.error("Error updating daily stats:", updateError);
                 }
             }
          }

          controller.close();
        } catch (err) {
          console.error('Streaming error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
        headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
        }
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
