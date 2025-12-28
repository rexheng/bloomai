
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

console.log("--- Verifying Setup ---");
console.log(`Supabase URL: ${supabaseUrl ? 'Found' : 'MISSING'}`);
console.log(`Supabase Service Key: ${supabaseKey ? 'Found' : 'MISSING'}`);
console.log(`Gemini API Key: ${geminiKey ? 'Found' : 'MISSING'}`);

async function verify() {
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase Config Missing");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Check Database connection & Tables
  console.log("\nChecking Database Tables...");
  const tables = ['profiles', 'items', 'conversations', 'messages', 'user_items'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
       console.error(`❌ Table '${table}': Error - ${error.message}`);
    } else {
       console.log(`✅ Table '${table}': OK`);
    }
  }

  // 2. Check Gemini
  console.log("\nChecking Gemini API...");
  if (!geminiKey) {
      console.error("❌ Gemini Key Missing");
  } else {
      try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          
          const result = await model.generateContent("Hello");
           
           if (result) {
                console.log("✅ Gemini API: OK");
           }
      } catch (e: any) {
          console.error("❌ Gemini API: Error -", e.message);
      }
  }

}

verify();
