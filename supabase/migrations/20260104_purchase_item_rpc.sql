-- Migration: Atomic Purchase Item Function
-- This creates a database function for atomic purchase transactions with row locking

-- Drop existing function if it exists to allow recreation
DROP FUNCTION IF EXISTS public.purchase_item(UUID, UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.purchase_item(
    p_user_id UUID,
    p_item_id UUID,
    p_expected_cost INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item_record RECORD;
    v_profile_record RECORD;
    v_existing_ownership INTEGER;
    v_new_balance INTEGER;
    v_points_needed INTEGER;
BEGIN
    -- Step 1: Get and lock the item record (using FOR SHARE to allow concurrent reads)
    SELECT id, name, sprite_id, point_cost, is_premium_only, is_active, category, placement_type, image_url
    INTO v_item_record
    FROM public.items
    WHERE id = p_item_id
    FOR SHARE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;
    
    -- Step 1b: Check item is active
    IF v_item_record.is_active = FALSE THEN
        RETURN json_build_object('success', false, 'error', 'Item is no longer available for purchase');
    END IF;
    
    -- Step 1c: Validate expected cost matches current price (prevents stale UI purchases)
    IF v_item_record.point_cost != p_expected_cost THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Item price has changed. Please refresh and try again.',
            'current_price', v_item_record.point_cost
        );
    END IF;
    
    -- Step 2: Lock the user's profile and get current points (FOR UPDATE for exclusive lock)
    SELECT id, current_points, is_premium
    INTO v_profile_record
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Step 3: Check premium requirement
    IF v_item_record.is_premium_only = TRUE AND v_profile_record.is_premium = FALSE THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'This item requires a premium subscription',
            'premium_required', true
        );
    END IF;
    
    -- Step 4: Check for existing ownership (prevent duplicate purchases)
    SELECT COUNT(*) INTO v_existing_ownership
    FROM public.user_items
    WHERE user_id = p_user_id AND item_id = p_item_id;
    
    IF v_existing_ownership > 0 THEN
        RETURN json_build_object('success', false, 'error', 'You already own this item');
    END IF;
    
    -- Step 5: Check sufficient points
    IF v_profile_record.current_points < v_item_record.point_cost THEN
        v_points_needed := v_item_record.point_cost - v_profile_record.current_points;
        RETURN json_build_object(
            'success', false, 
            'error', format('Not enough points. You need %s more points.', v_points_needed),
            'current_points', v_profile_record.current_points,
            'item_cost', v_item_record.point_cost,
            'points_needed', v_points_needed
        );
    END IF;
    
    -- Step 6: Deduct points atomically
    v_new_balance := v_profile_record.current_points - v_item_record.point_cost;
    
    UPDATE public.profiles
    SET current_points = v_new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Step 7: Create ownership record with placement status
    INSERT INTO public.user_items (user_id, item_id, is_placed, placed_slot_id, unlocked_at)
    VALUES (p_user_id, p_item_id, FALSE, NULL, NOW());
    
    -- Step 8: Log the purchase activity
    INSERT INTO public.activity_log (user_id, activity_type, points_earned, metadata)
    VALUES (
        p_user_id,
        'purchase_item',
        -v_item_record.point_cost,
        jsonb_build_object(
            'item_id', p_item_id, 
            'item_name', v_item_record.name,
            'sprite_id', v_item_record.sprite_id,
            'category', v_item_record.category,
            'cost', v_item_record.point_cost
        )
    );
    
    -- Return success with new balance and item details
    RETURN json_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'item_id', p_item_id,
        'item_name', v_item_record.name,
        'item_category', v_item_record.category,
        'item_image_url', v_item_record.image_url
    );
    
EXCEPTION
    WHEN unique_violation THEN
        -- Catches race condition if somehow two purchases slip through
        RETURN json_build_object('success', false, 'error', 'You already own this item');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.purchase_item(UUID, UUID, INTEGER) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.purchase_item IS 'Atomic purchase transaction with row locking to prevent race conditions and double purchases';
