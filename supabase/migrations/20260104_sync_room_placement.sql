-- Migration: Sync Room Placement RPC
-- Creates a function to atomically sync inventory is_placed status with room configuration

CREATE OR REPLACE FUNCTION public.sync_room_placement(
    p_user_id UUID,
    p_placed_items JSONB,
    p_wallpaper_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item_id UUID;
    v_slot_id TEXT;
    v_item_record RECORD;
BEGIN
    -- 1. Reset all items for this user to unplaced
    UPDATE public.user_items
    SET is_placed = FALSE,
        placed_slot_id = NULL
    WHERE user_id = p_user_id;

    -- 2. Mark wallpaper as placed if exists
    IF p_wallpaper_id IS NOT NULL THEN
        UPDATE public.user_items
        SET is_placed = TRUE,
            placed_slot_id = 'WALLPAPER'
        WHERE user_id = p_user_id AND item_id = p_wallpaper_id;
    END IF;

    -- 3. Mark placed items as placed
    -- Iterate through the JSONB array
    FOR v_item_record IN SELECT * FROM jsonb_to_recordset(p_placed_items) AS x(item_id UUID, slot_id TEXT)
    LOOP
        UPDATE public.user_items
        SET is_placed = TRUE,
            placed_slot_id = v_item_record.slot_id
        WHERE user_id = p_user_id AND item_id = v_item_record.item_id;
    END LOOP;

    -- 4. Update room_config table (Upsert)
    INSERT INTO public.room_config (user_id, placed_items, wallpaper_id, updated_at)
    VALUES (p_user_id, p_placed_items, p_wallpaper_id, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        placed_items = EXCLUDED.placed_items,
        wallpaper_id = EXCLUDED.wallpaper_id,
        updated_at = NOW();

    RETURN json_build_object('success', true);

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION public.sync_room_placement(UUID, JSONB, UUID) TO authenticated;
