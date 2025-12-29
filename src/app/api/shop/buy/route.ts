
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

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

  try {
      const { itemId } = await req.json();
      if (!itemId) {
          return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
      }

      // 1. Get Item Cost
      const { data: item, error: itemError } = await dbClient
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();
      
      if (itemError || !item) {
          return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      // 2. Get User Points
      const { data: profile, error: profileError } = await dbClient
        .from('profiles')
        .select('current_points')
        .eq('id', user!.id)
        .single();
    
      if (profileError || !profile) {
          return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      if (profile.current_points < item.point_cost) {
          return NextResponse.json({ error: 'Not enough points' }, { status: 400 });
      }

      // 3. Purchase Transaction (Ideally RPC or Transaction, but sequentially for MVP)
      
      // Deduct Points
      const { error: updateError } = await dbClient
        .from('profiles')
        .update({ current_points: profile.current_points - item.point_cost })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      // Add to Inventory
      const { error: unlockError } = await dbClient
        .from('user_items')
        .insert({
            user_id: user!.id,
            item_id: itemId
        });
      
      if (unlockError) {
          // Rollback points (Approximation)
           await dbClient
            .from('profiles')
            .update({ current_points: profile.current_points })
            .eq('id', user!.id);
          throw unlockError;
      }

      // Log Activity
      await dbClient.from('activity_log').insert({
          user_id: user!.id,
          activity_type: 'purchase_item',
          points_earned: -item.point_cost,
          metadata: { item_name: item.name }
      });


      return NextResponse.json({ success: true, remainingPoints: profile.current_points - item.point_cost });

  } catch (err: any) {
      console.error("Purchase error:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
