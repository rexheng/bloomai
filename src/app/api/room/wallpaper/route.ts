import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

interface WallpaperResult {
  success: boolean;
  error?: string;
  wallpaper_name?: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();
  let dbClient = supabase;

  // DEV BYPASS: Allow unauthenticated access during development
  if (!user) {
    user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
    dbClient = createAdminClient();
  }

  try {
    const { wallpaperId } = await req.json();

    // wallpaperId can be null to remove wallpaper

    // Call the atomic set_room_wallpaper function
    const { data: result, error: rpcError } = await dbClient
      .rpc('set_room_wallpaper', {
        p_user_id: user!.id,
        p_wallpaper_id: wallpaperId
      });

    if (rpcError) {
      console.error("Set wallpaper RPC error:", rpcError);
      return NextResponse.json({ 
        error: 'Failed to set wallpaper. Please try again.',
        details: rpcError.message 
      }, { status: 500 });
    }

    const wallpaperResult = result as WallpaperResult;

    if (!wallpaperResult.success) {
      return NextResponse.json({
        error: wallpaperResult.error
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      wallpaper_name: wallpaperResult.wallpaper_name
    });

  } catch (err: any) {
    console.error("Set wallpaper error:", err);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again.',
      details: err.message 
    }, { status: 500 });
  }
}
