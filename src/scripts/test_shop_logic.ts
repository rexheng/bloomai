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

async function testShop() {
  console.log("--- Testing Shop Logic ---");
  const userId = 'fd998a0a-e068-4fef-af1a-d10267318f9b'; // Dev user

  // 1. Fetch Items
  console.log("\n1. Fetching Items...");
  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('*')
    .limit(1);
  
  if (itemsError || !items || items.length === 0) {
      console.error("❌ Failed to fetch items:", itemsError?.message);
      return;
  }
  const itemToBuy = items[0];
  console.log(`Found item: ${itemToBuy.name} (Cost: ${itemToBuy.point_cost})`);

  // 2. Setup User (Give Points)
  console.log("\n2. Setting up User Points...");
  const initialPoints = 1000;
  await supabase
    .from('profiles')
    .update({ current_points: initialPoints })
    .eq('id', userId);
  
  console.log(`User points set to ${initialPoints}`);

  // 3. Clear Inventory (for clean test)
  await supabase
    .from('user_items')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemToBuy.id);

  // 4. Simulate Buy (Logic from API)
  console.log(`\n3. Buying ${itemToBuy.name}...`);
  
  // 4a. Check Points
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_points')
    .eq('id', userId)
    .single();

  if (!profile || profile.current_points < itemToBuy.point_cost) {
      console.error("❌ Not enough points (Unexpected)");
      return;
  }

  // 4b. Deduct Points
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ current_points: profile.current_points - itemToBuy.point_cost })
    .eq('id', userId);

  if (updateError) {
      console.error("❌ Failed to deduct points:", updateError.message);
      return;
  }

  // 4c. Add to Inventory
  const { error: unlockError } = await supabase
    .from('user_items')
    .insert({
        user_id: userId,
        item_id: itemToBuy.id
    });

  if (unlockError) {
      console.error("❌ Failed to unlock item:", unlockError.message);
      // Rollback would go here
      return;
  }

  console.log("✅ Purchase successful");

  // 5. Verify Final State
  console.log("\n4. Verifying State...");
  
  const { data: finalProfile } = await supabase
    .from('profiles')
    .select('current_points')
    .eq('id', userId)
    .single();
    
  const { data: inventory } = await supabase
    .from('user_items')
    .select('*')
    .eq('user_id', userId)
    .eq('item_id', itemToBuy.id);

  const expectedPoints = initialPoints - itemToBuy.point_cost;
  
  if (finalProfile?.current_points === expectedPoints) {
      console.log(`✅ Points correct: ${finalProfile.current_points}`);
  } else {
      console.error(`❌ Points mismatch: Expected ${expectedPoints}, got ${finalProfile?.current_points}`);
  }

  if (inventory && inventory.length > 0) {
      console.log(`✅ Item found in inventory`);
  } else {
      console.error(`❌ Item NOT found in inventory`);
  }

}

testShop();
