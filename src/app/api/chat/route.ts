import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 1. Check Auth & Dev Bypass
  let {
    data: { user },
  } = await supabase.auth.getUser();

  let dbClient = supabase;
  let userProfile: any = null;

  if (!user) {
    console.warn("Using Dev Bypass User ID in Chat API");
    // Mock user for dev
    user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
    // Use Admin client to bypass RLS since we have no session
    dbClient = createAdminClient();
    
    // Mock profile for dev
    userProfile = {
        display_name: 'Traveler',
        current_streak: 0,
        total_points: 0,
        unlocked_items: []
    };
  } else {
      // Fetch actual profile
      const { data: profile } = await dbClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const { data: items } = await dbClient
        .from('user_items')
        .select('*, items(*)')
        .eq('user_id', user.id);
        
      userProfile = {
          ...profile,
          unlocked_items: items?.map((i: any) => i.items.name) || []
      };
  }


  try {
    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]; // User's latest message

    // 2. Persist User Message
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

    // 4. Construct System Instruction with Context
    const systemInstruction = `You are Bloom, a warm and supportive AI companion in a productivity journalling app. Your role is to:

1. CELEBRATE the user's accomplishments, no matter how small
2. ENCOURAGE reflection on their day and goals
3. ASK thoughtful follow-up questions
4. SUGGEST gentle improvements without being preachy
5. REMEMBER context from the conversation

Your personality:
- Warm and friendly, like a supportive friend
- Gently enthusiastic, not over-the-top
- Non-judgemental and accepting
- Curious about the user's life
- Occasionally playful but always respectful

Guidelines:
- Keep responses concise (2-4 sentences typically)
- Use encouraging language
- Avoid giving unsolicited advice
- Never dismiss or minimise user's feelings
- If user seems stressed, prioritise empathy over productivity

User's current progress:
- Current streak: ${userProfile?.current_streak || 0} days
- Total points: ${userProfile?.total_points || 0}
- Recently unlocked: ${userProfile?.unlocked_items?.slice(0, 3).join(', ') || 'None'}

Remember: You're here to make journalling feel rewarding, not like a chore.`;

    // 5. Initialize Chat (Standard Pattern)
    const model = client.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: systemInstruction 
    });

    const chat = model.startChat({
      history: history,
    });

    // 6. Stream Response
    const result = await chat.sendMessageStream(lastMessage.content);
    
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
             

             // 8. Award Points & XP
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
                        // Reset streak if missed a day (optional, strict mode)
                        // For MVP, requirements say: "Grace period: streak maintained if user returns within 48 hours" implies loose comparison
                        // But let's keep it simple: if not yesterday, it stays same or resets? 
                        // MVP req: "Daily streak counter (consecutive days)". 
                        // If we want strict reset: newStreak = 1;
                        // Existing logic didn't reset, it just didn't increment. Let's stick to safe increment logic for now.
                        if (!isYesterday) newStreak = 1; 
                     }
                 } else {
                    newStreak = 1;
                 }
                 
                 pointsToAdd = 10;
                 lastActiveDate = today;
                 
                 // Log activity for check-in
                 await dbClient.from('activity_log').insert({
                     user_id: user!.id,
                     activity_type: 'daily_check_in',
                     points_earned: pointsToAdd
                 });
             }

             // XP & Level Logic (Per Message)
             const xpPerMessage = 10;
             const newMessagesSent = (userProfile?.messages_sent || 0) + 1;
             const newXp = (userProfile?.xp || 0) + xpPerMessage;
             const newLevel = Math.floor(newXp / 100) + 1;

             // Update Profile
             const updates: any = {
                 messages_sent: newMessagesSent,
                 xp: newXp,
                 level: newLevel,
                 // Only update these if changed/applicable
                 ...(lastActiveDate !== userProfile?.last_active_date && { last_active_date: lastActiveDate }),
                 ...(newStreak !== userProfile?.current_streak && { current_streak: newStreak }),
                 ...(pointsToAdd > 0 && { 
                     total_points: (userProfile?.total_points || 0) + pointsToAdd,
                     current_points: (userProfile?.current_points || 0) + pointsToAdd 
                 })
             };

             const { error: updateError } = await dbClient.from('profiles').update(updates).eq('id', user!.id);
                 
             if (updateError) {
                 console.error("Error updating profile stats:", updateError);
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
