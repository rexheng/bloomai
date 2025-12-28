
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  let { data: { user } } = await supabase.auth.getUser();
  let dbClient = supabase;

   if (!user) {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Dev Bypass
    user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
    dbClient = createAdminClient();
  }

  const { data: userItems, error } = await dbClient
    .from('user_items')
    .select('item_id')
    .eq('user_id', user!.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return simple array of item IDs for easy checking on frontend
  const inventory = userItems.map(ui => ui.item_id);

  return NextResponse.json(inventory);
}
