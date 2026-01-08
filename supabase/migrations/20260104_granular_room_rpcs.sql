-- Migration: Granular Room RPCs
-- Functions to place and remove individual items from room configuration

-- 1. Place Item Function
CREATE OR REPLACE FUNCTION public.place_item_in_room(
    p_user_id UUID,
    p_item_id UUID,
    p_slot_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_room_config RECORD;
    v_placed_items JSONB;
BEGIN
    -- Update user_items status
    UPDATE public.user_items
    SET is_placed = TRUE,
        placed_slot_id = p_slot_id
    WHERE user_id = p_user_id AND item_id = p_item_id;

    -- Get current room config
    SELECT * INTO v_room_config FROM public.room_config WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        -- Create new config if not exists
        v_placed_items := jsonb_build_array(jsonb_build_object('item_id', p_item_id, 'slot_id', p_slot_id));
        INSERT INTO public.room_config (user_id, placed_items, updated_at)
        VALUES (p_user_id, v_placed_items, NOW());
    ELSE
        -- Remove any existing placement for this item AND any item in the target slot
        -- (Complex JSONB manipulation is easier in app code, but we do basic filter here)
        -- Actually, robust JSONB modification in Postgres is standard but verbose.
        
        -- Strategy: Filter out this item ID, Filter out this Slot ID, then Add new.
        SELECT jsonb_agg(elem) INTO v_placed_items
        FROM jsonb_array_elements(COALESCE(v_room_config.placed_items, '[]'::jsonb)) elem
        WHERE (elem->>'item_id')::UUID != p_item_id 
          AND elem->>'slot_id' != p_slot_id;

        -- Append new placement
        v_placed_items := COALESCE(v_placed_items, '[]'::jsonb) || jsonb_build_object('item_id', p_item_id, 'slot_id', p_slot_id);

        UPDATE public.room_config
        SET placed_items = v_placed_items,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;

    RETURN json_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. Remove Item Function
CREATE OR REPLACE FUNCTION public.remove_item_from_room(
    p_user_id UUID,
    p_item_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_placed_items JSONB;
BEGIN
    -- Update user_items status
    UPDATE public.user_items
    SET is_placed = FALSE,
        placed_slot_id = NULL
    WHERE user_id = p_user_id AND item_id = p_item_id;

    -- Update room_config
    UPDATE public.room_config
    SET placed_items = (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements(placed_items) elem
        WHERE (elem->>'item_id')::UUID != p_item_id
    ),
    updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN json_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_item_in_room(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_item_from_room(UUID, UUID) TO authenticated;
