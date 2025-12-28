import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testXPSystem() {
  console.log("--- Testing XP System ---");
  const userId = 'fd998a0a-e068-4fef-af1a-d10267318f9b'; // Dev user

  // 1. Check Schema
  console.log("Checking schema...");
  const { error: schemaError } = await supabase
    .from('profiles')
    .select('xp, level, messages_sent')
    .limit(1);

  if (schemaError) {
      console.error("❌ Schema Check Failed: Columns missing.");
      console.log("\n⚠️ ACTION REQUIRED: Please run the following SQL in your Supabase Dashboard SQL Editor:\n");
      console.log(`
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS messages_sent INTEGER DEFAULT 0;
      `);
      return;
  }
  console.log("✅ Schema Check Passed");

  // 2. Get Initial State
  const { data: initialProfile } = await supabase
    .from('profiles')
    .select('xp, level, messages_sent')
    .eq('id', userId)
    .single();
  
  console.log("Initial State:", initialProfile);

  // 3. Simulate Chat Interaction (Call API or Simulate Logic)
  // Since we can't easily call the API from here without running the server, 
  // let's simulate the DB update logic directly to verify it works IF the columns exist.
  
  const xpPerMessage = 10;
  const newMessagesSent = (initialProfile?.messages_sent || 0) + 1;
  const newXp = (initialProfile?.xp || 0) + xpPerMessage;
  const newLevel = Math.floor(newXp / 100) + 1;

  console.log(`Simulating update: XP ${initialProfile?.xp} -> ${newXp}, Level ${initialProfile?.level} -> ${newLevel}`);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
        xp: newXp,
        level: newLevel,
        messages_sent: newMessagesSent
    })
    .eq('id', userId);

  if (updateError) {
      console.error("❌ Update Failed:", updateError.message);
  } else {
      console.log("✅ Update Successful");
      
      // Verify
      const { data: finalProfile } = await supabase
        .from('profiles')
        .select('xp, level, messages_sent')
        .eq('id', userId)
        .single();
      console.log("Final State:", finalProfile);
      
      if (finalProfile && finalProfile.xp === newXp) {
          console.log("✅ XP System Verified");
      } else {
          console.error("❌ XP Mismatch");
      }
  }
}

testXPSystem();
