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

async function checkSchema() {
  console.log("Checking profiles table schema...");
  
  // Try to select the columns we expect
  const { data, error } = await supabase
    .from('profiles')
    .select('xp, level, messages_sent')
    .limit(1);

  if (error) {
      console.error("Error selecting columns:", error.message);
      console.log("It seems the columns are missing.");
  } else {
      console.log("Columns exist!");
  }
}

checkSchema();
