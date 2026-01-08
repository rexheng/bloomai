
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { ShopItem, ShopItemWithOwnership } from '@/types/database';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  
  let { data: { user } } = await supabase.auth.getUser();
  let dbClient = supabase;

  // DEV BYPASS: Allow unauthenticated access during development
  if (!user) {
    user = { id: 'fd998a0a-e068-4fef-af1a-d10267318f9b' } as any;
    dbClient = createAdminClient();
  }

  // Parse query parameters for filtering
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const sortBy = searchParams.get('sortBy') || 'sort_order'; // sort_order, point_cost, rarity
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  console.log("Fetching shop items...", { category, sortBy, sortOrder });

  try {
    // Build the query - fetch all items
    // Note: is_active filter is optional (column may not exist in older schemas)
    let query = dbClient
      .from('items')
      .select('*');

    // Filter by category if specified
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Sort - use point_cost as fallback if sort_order doesn't exist
    const ascending = sortOrder === 'asc';
    query = query.order('point_cost', { ascending });

    const { data: items, error: itemsError } = await query;

    if (itemsError) {
      console.error("Error fetching items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Filter out inactive items if the column exists
    const activeItems = (items || []).filter((item: any) => 
      item.is_active === undefined || item.is_active === true
    );

    // Fetch user's owned items for ownership status
    const { data: ownedItems, error: ownedError } = await dbClient
      .from('user_items')
      .select('item_id')
      .eq('user_id', user!.id);

    if (ownedError) {
      console.error("Error fetching owned items:", ownedError);
      // Continue without ownership data
    }

    // Create a set of owned item IDs for O(1) lookup
    const ownedItemIds = new Set(ownedItems?.map(oi => oi.item_id) || []);

    // Add ownership status to each item
    const itemsWithOwnership: ShopItemWithOwnership[] = activeItems.map((item: any) => ({
      ...item,
      // Provide defaults for optional columns that may not exist yet
      sprite_id: item.sprite_id || `${item.category}_${item.name?.toLowerCase().replace(/\s+/g, '_')}`,
      placement_type: item.placement_type || 'surface',
      size: item.size || 'small',
      sort_order: item.sort_order || 0,
      is_active: item.is_active ?? true,
      is_owned: ownedItemIds.has(item.id)
    }));

    console.log(`Found ${itemsWithOwnership.length} items (${ownedItemIds.size} owned)`);
    
    return NextResponse.json(itemsWithOwnership);
  } catch (err: any) {
    console.error("Unexpected error in shop items:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
