import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();
  let dbClient = supabase;

  if (!user) {
    // if (process.env.NODE_ENV !== 'development') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // Dev Bypass
    user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
    dbClient = createAdminClient();
  }

  // Fetch room config
  let { data: roomConfig, error } = await dbClient
    .from('room_config')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  if (error && error.code === 'PGRST116') {
      // Not found, create default
      const { data: newConfig, error: createError } = await dbClient
        .from('room_config')
        .insert({
            user_id: user!.id,
            placed_items: []
        })
        .select()
        .single();
      
      if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      roomConfig = newConfig;
  } else if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(roomConfig);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();
  let dbClient = supabase;

  if (!user) {
    // if (process.env.NODE_ENV !== 'development') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // Dev Bypass
    user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
    dbClient = createAdminClient();
  }

  const { placed_items, wallpaper_id } = await req.json();

  const updates: any = {
      updated_at: new Date().toISOString()
  };
  
  if (placed_items !== undefined) updates.placed_items = placed_items;
  if (wallpaper_id !== undefined) updates.wallpaper_id = wallpaper_id;

  const { data, error } = await dbClient
    .from('room_config')
    .upsert({
        user_id: user!.id,
        ...updates
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
