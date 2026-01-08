
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { InventoryItem } from '@/types/database';

export async function GET(req: NextRequest) {
  console.log("[Inventory API] Request received");
  const supabase = await createClient();
  
  let { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log("[Inventory API] Auth check:", { userId: user?.id, authError });

  let dbClient = supabase;

  if (!user) {
    console.log("[Inventory API] No user found, activating DEV BYPASS");
    // DEV BYPASS: Allow unauthenticated access during development
    user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
    dbClient = createAdminClient();
  } else {
    console.log("[Inventory API] Authenticated user found, using standard client");
  }

  // Parse query parameters
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter'); // 'all', 'available', 'placed'
  const category = searchParams.get('category');
  const format = searchParams.get('format'); // 'full' or 'ids' (default: 'full')

  try {
    // For simple ID-only format (backward compatible)
    if (format === 'ids') {
      const { data: userItems, error } = await dbClient
        .from('user_items')
        .select('item_id')
        .eq('user_id', user!.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const inventory = userItems.map(ui => ui.item_id);
      return NextResponse.json(inventory);
    }

    // Full inventory with item details
    const { data: userItems, error: inventoryError } = await dbClient
      .from('user_items')
      .select(`
        id,
        item_id,
        is_placed,
        placed_slot_id,
        unlocked_at,
        items:item_id (
          id,
          sprite_id,
          name,
          description,
          category,
          placement_type,
          size,
          point_cost,
          image_url,
          rarity,
          is_premium_only,
          sort_order,
          is_active,
          created_at
        )
      `)
      .eq('user_id', user!.id)
      .order('unlocked_at', { ascending: false });

    if (inventoryError) {
      console.error("[Inventory API] Database Error:", inventoryError);
      return NextResponse.json({ error: inventoryError.message, details: inventoryError }, { status: 500 });
    }

    console.log(`[Inventory API] Successfully fetched ${userItems?.length ?? 0} items`);

    // Transform the data into InventoryItem format
    let inventoryItems: InventoryItem[] = (userItems || [])
      .filter(ui => ui.items) // Filter out any items that no longer exist
      .map(ui => ({
        ...(ui.items as any),
        ownership_id: ui.id,
        is_placed: ui.is_placed || false,
        placed_slot_id: ui.placed_slot_id,
        unlocked_at: ui.unlocked_at
      }));

    // Apply filters
    if (filter === 'available') {
      inventoryItems = inventoryItems.filter(item => !item.is_placed);
    } else if (filter === 'placed') {
      inventoryItems = inventoryItems.filter(item => item.is_placed);
    }

    if (category && category !== 'all') {
      inventoryItems = inventoryItems.filter(item => item.category === category);
    }

    // Group by category for UI convenience
    const grouped = {
      all: inventoryItems,
      available: inventoryItems.filter(item => !item.is_placed),
      placed: inventoryItems.filter(item => item.is_placed),
      byCategory: {
        plant: inventoryItems.filter(item => item.category === 'plant'),
        furniture: inventoryItems.filter(item => item.category === 'furniture'),
        wallpaper: inventoryItems.filter(item => item.category === 'wallpaper'),
        accessory: inventoryItems.filter(item => item.category === 'accessory'),
      }
    };

    return NextResponse.json({
      items: inventoryItems,
      counts: {
        total: inventoryItems.length,
        available: grouped.available.length,
        placed: grouped.placed.length
      },
      grouped
    });

  } catch (err: any) {
    console.error("Inventory fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
