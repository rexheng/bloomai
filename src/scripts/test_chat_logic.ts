import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
  console.error('Missing credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);

async function testChat() {
  console.log("--- Testing Chat Logic ---");

  // 1. Mock User
  const userId = 'fd998a0a-e068-4fef-af1a-d10267318f9b'; // Dev user
  console.log(`Using User ID: ${userId}`);

  // 2. Fetch Profile (Test DB Read)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
      console.log("Profile not found or error (expected if first run):", profileError.message);
  } else {
      console.log("Profile found:", profile.display_name);
  }

  // 3. Test Gemini Generation
  console.log("\nTesting Gemini Generation...");
  const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: "You are a helpful assistant."
  });

  const chat = model.startChat({
      history: []
  });

  try {
      const message = "Hello, how are you today?";
      console.log(`User: ${message}`);
      
      const result = await chat.sendMessageStream(message);
      
      process.stdout.write("Bloom: ");
      for await (const chunk of result.stream) {
          const text = chunk.text();
          process.stdout.write(text);
      }
      console.log("\n\n✅ Chat Test Complete");

  } catch (e: any) {
      console.error("❌ Chat Error:", e.message);
  }
}

testChat();
