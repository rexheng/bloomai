
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
    const { itemId } = await req.json();

    if (!itemId) {
        return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const { data, error } = await dbClient.rpc('remove_item_from_room', {
        p_user_id: userId,
        p_item_id: itemId
    });

    if (error) {
        console.error("Remove RPC error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
