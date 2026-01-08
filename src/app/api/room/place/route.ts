
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();
  let dbClient = supabase;
  let userId: string;

  // DEV BYPASS: Allow unauthenticated access during development
  if (!user) {
    userId = 'fd998a0a-e068-4fef-af1a-d10267318f9b';
    dbClient = createAdminClient();
  } else {
    userId = user.id;
  }


  try {
    const { itemId, slotId } = await req.json();

    if (!itemId || !slotId) {
        return NextResponse.json({ error: 'Missing itemId or slotId' }, { status: 400 });
    }

    const { data, error } = await dbClient.rpc('place_item_in_room', {
        p_user_id: userId,
        p_item_id: itemId,
        p_slot_id: slotId
    });

    if (error) {
        console.error("Place RPC error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
