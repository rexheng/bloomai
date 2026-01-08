
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { PurchaseResult } from '@/types/database';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  
  let { data: { user } } = await supabase.auth.getUser();
  let dbClient = supabase;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { itemId, expectedCost } = body;
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    // If expectedCost not provided, fetch it first (for backward compatibility)
    let costToVerify = expectedCost;
    if (costToVerify === undefined) {
      const { data: item, error: itemError } = await dbClient
        .from('items')
        .select('point_cost')
        .eq('id', itemId)
        .single();
      
      if (itemError || !item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      costToVerify = item.point_cost;
    }

    // Call the atomic purchase function
    const { data: result, error: rpcError } = await dbClient
      .rpc('purchase_item', {
        p_user_id: user!.id,
        p_item_id: itemId,
        p_expected_cost: costToVerify
      });

    if (rpcError) {
      console.error("Purchase RPC error:", rpcError);
      return NextResponse.json({ 
        error: 'Purchase failed. Please try again.',
        details: rpcError.message 
      }, { status: 500 });
    }

    const purchaseResult = result as PurchaseResult;

    if (!purchaseResult.success) {
      // Determine appropriate status code based on error type
      let statusCode = 400;
      
      if (purchaseResult.error?.includes('not found')) {
        statusCode = 404;
      } else if (purchaseResult.premium_required) {
        statusCode = 403;
      }

      return NextResponse.json({
        error: purchaseResult.error,
        points_needed: purchaseResult.points_needed,
        current_points: purchaseResult.current_points,
        current_price: purchaseResult.current_price,
        premium_required: purchaseResult.premium_required
      }, { status: statusCode });
    }

    // Success response
    return NextResponse.json({
      success: true,
      new_balance: purchaseResult.new_balance,
      item: {
        id: purchaseResult.item_id,
        name: purchaseResult.item_name,
        category: purchaseResult.item_category,
        image_url: purchaseResult.item_image_url
      }
    });

  } catch (err: any) {
    console.error("Purchase error:", err);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again.',
      details: err.message 
    }, { status: 500 });
  }
}
