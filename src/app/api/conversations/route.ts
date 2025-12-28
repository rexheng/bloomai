import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
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

  const { title } = await req.json();

  const { data, error } = await dbClient
    .from('conversations')
    .insert({
        user_id: user!.id,
        title: title || 'New Conversation'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
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

    const { data, error } = await dbClient
        .from('conversations')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
