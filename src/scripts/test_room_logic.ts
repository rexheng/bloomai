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

async function testRoom() {
  console.log("--- Testing Room Logic ---");
  const userId = 'fd998a0a-e068-4fef-af1a-d10267318f9b'; // Dev user

  // 1. Get Room (Should create if missing)
  console.log("\n1. Fetching Room Config...");
  let { data: room, error } = await supabase
    .from('room_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
      console.log("Room not found, creating...");
      const { data: newRoom, error: createError } = await supabase
        .from('room_config')
        .insert({ user_id: userId, placed_items: [] })
        .select()
        .single();
      
      if (createError) {
          console.error("❌ Failed to create room:", createError.message);
          return;
      }
      room = newRoom;
  } else if (error) {
      console.error("❌ Error fetching room:", error.message);
      return;
  }

  console.log("Room Config:", room);

  // 2. Update Room
  console.log("\n2. Updating Room...");
  const testItems = [
      { itemId: 'test-item-id', x: 100, y: 100 }
  ];

  const { data: updatedRoom, error: updateError } = await supabase
    .from('room_config')
    .update({ placed_items: testItems })
    .eq('user_id', userId)
    .select()
    .single();

  if (updateError) {
      console.error("❌ Failed to update room:", updateError.message);
      return;
  }

  console.log("Updated Room:", updatedRoom);

  if (JSON.stringify(updatedRoom.placed_items) === JSON.stringify(testItems)) {
      console.log("✅ Room update verified");
  } else {
      console.error("❌ Room update mismatch");
  }
}

testRoom();
