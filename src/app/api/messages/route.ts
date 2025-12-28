import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const searchParams = req.nextUrl.searchParams;
  const conversationId = searchParams.get('conversationId');

  let {
    data: { user },
  } = await supabase.auth.getUser();

  let dbClient = supabase;
  if (!user) {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
    dbClient = createAdminClient();
  }

  if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }

  const { data, error } = await dbClient
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
