import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { RoomConfigWithDetails, PlacedItemEntry, ShopItem, RoomConfig } from '@/types/database';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();
  let dbClient = supabase;

  // DEV BYPASS: Allow unauthenticated access during development
  if (!user) {
    user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
    dbClient = createAdminClient();
  }

  try {
    // Fetch room config with wallpaper details
    let { data: roomConfig, error } = await dbClient
      .from('room_config')
      .select(`
        *,
        wallpaper:wallpaper_id (
          id,
          sprite_id,
          name,
          description,
          category,
          image_url,
          rarity
        )
      `)
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
      roomConfig = { ...newConfig, wallpaper: null };
    } else if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch details for all placed items
    const placedItems = (roomConfig.placed_items || []) as PlacedItemEntry[];
    let placedItemsDetails: Array<PlacedItemEntry & { item: ShopItem }> = [];

    if (placedItems.length > 0) {
      const itemIds = placedItems.map(p => p.item_id);
      
      const { data: items, error: itemsError } = await dbClient
        .from('items')
        .select('*')
        .in('id', itemIds);

      if (!itemsError && items) {
        const itemsMap = new Map(items.map(item => [item.id, item]));
        placedItemsDetails = placedItems
          .filter(p => itemsMap.has(p.item_id))
          .map(p => ({
            ...p,
            item: itemsMap.get(p.item_id)
          }));
      }
    }

    // Build the response
    const response: RoomConfigWithDetails = {
      ...roomConfig,
      placed_items_details: placedItemsDetails
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Room config fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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
    const { placed_items, wallpaper_id } = await req.json();

    // specific validation could go here...

    // Use RPC to atomically update room config AND inventory status
    const { data: result, error } = await dbClient.rpc('sync_room_placement', {
      p_user_id: user!.id,
      p_placed_items: placed_items || [],
      p_wallpaper_id: wallpaper_id || null
    });

    if (error) {
      console.error("Sync room RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!(result as any).success) {
         return NextResponse.json({ error: (result as any).error || 'Failed to sync room' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Room config update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
