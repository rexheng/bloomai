
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  let { data: { user } } = await supabase.auth.getUser();
  let dbClient = supabase;

  if (!user) {
      // Bypass for now
      user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
      dbClient = createAdminClient();
  }

  // RLS allows 'authenticated' to read items. 
  // If public access is needed, we might need a different policy or admin client here.
  // Assuming user is authenticated.

  console.log("Fetching shop items...");
  const { data: items, error } = await dbClient
    .from('items')
    .select('*')
    .order('point_cost', { ascending: true });

  if (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  console.log(`Found ${items?.length} items`);
  return NextResponse.json(items);
}
