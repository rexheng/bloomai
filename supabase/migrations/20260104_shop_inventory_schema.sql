-- Migration: Add Shop & Inventory System Columns
-- This migration adds columns required for the complete shop, inventory, and room decoration system

-- ============================================
-- Part 1: Items Table Enhancements
-- ============================================

-- Add new columns to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS sprite_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS placement_type TEXT CHECK (placement_type IN ('surface', 'floor', 'wall', 'window')),
ADD COLUMN IF NOT EXISTS size TEXT CHECK (size IN ('small', 'medium', 'large')) DEFAULT 'small',
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index on sprite_id for faster lookups and deduplication
CREATE INDEX IF NOT EXISTS idx_items_sprite_id ON public.items(sprite_id);

-- Create index on is_active for shop queries
CREATE INDEX IF NOT EXISTS idx_items_is_active ON public.items(is_active);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);

-- Populate sprite_id for existing items based on category and name
UPDATE public.items 
SET sprite_id = LOWER(category || '_' || REPLACE(REPLACE(name, ' ', '_'), '''', ''))
WHERE sprite_id IS NULL;

-- Make sprite_id NOT NULL after populating existing records
ALTER TABLE public.items ALTER COLUMN sprite_id SET NOT NULL;

-- Set default placement_type based on category for existing items
UPDATE public.items SET placement_type = 'surface' WHERE category = 'plant' AND placement_type IS NULL;
UPDATE public.items SET placement_type = 'floor' WHERE category = 'furniture' AND placement_type IS NULL;
UPDATE public.items SET placement_type = 'wall' WHERE category = 'wallpaper' AND placement_type IS NULL;
UPDATE public.items SET placement_type = 'surface' WHERE category = 'accessory' AND placement_type IS NULL;

-- ============================================
-- Part 2: User Items (Inventory) Enhancements
-- ============================================

-- Add is_placed column to user_items table for tracking placement status
ALTER TABLE public.user_items 
ADD COLUMN IF NOT EXISTS is_placed BOOLEAN DEFAULT FALSE;

-- Add placed_slot_id to track which slot the item is placed in
ALTER TABLE public.user_items
ADD COLUMN IF NOT EXISTS placed_slot_id TEXT;

-- Create index for quick lookup of placed items
CREATE INDEX IF NOT EXISTS idx_user_items_is_placed ON public.user_items(is_placed) WHERE is_placed = TRUE;

-- ============================================
-- Part 3: Room Config Enhancements
-- ============================================

-- Ensure room_config has proper structure for placed_items JSONB
-- Each entry in placed_items should be: { item_id, slot_id, placed_at }
COMMENT ON COLUMN public.room_config.placed_items IS 
'Array of placed items: [{ "item_id": "uuid", "slot_id": "SHELF-T", "placed_at": "timestamp" }]';

-- ============================================
-- Part 4: Activity Log Enhancements
-- ============================================

-- Create index for purchase activity lookups
CREATE INDEX IF NOT EXISTS idx_activity_log_purchase ON public.activity_log(user_id, activity_type) 
WHERE activity_type = 'purchase_item';

-- ============================================
-- Part 5: Helper Functions
-- ============================================

-- Function to check if an item can be placed in a slot based on type compatibility
CREATE OR REPLACE FUNCTION public.validate_item_placement(
    p_item_id UUID,
    p_slot_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_item_category TEXT;
    v_item_placement_type TEXT;
BEGIN
    -- Get item details
    SELECT category, placement_type INTO v_item_category, v_item_placement_type
    FROM public.items
    WHERE id = p_item_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Basic slot type validation based on slot naming convention
    -- WALL slots accept wallpapers and wall items
    IF p_slot_id LIKE 'WALL%' THEN
        RETURN v_item_placement_type = 'wall' OR v_item_category = 'wallpaper';
    END IF;
    
    -- FLOOR slots accept floor items and furniture
    IF p_slot_id LIKE 'FLOOR%' THEN
        RETURN v_item_placement_type = 'floor' OR v_item_category = 'furniture';
    END IF;
    
    -- SHELF and DESK slots accept surface items (plants, accessories)
    IF p_slot_id LIKE 'SHELF%' OR p_slot_id LIKE 'DESK%' THEN
        RETURN v_item_placement_type = 'surface' OR v_item_category IN ('plant', 'accessory');
    END IF;
    
    -- WINDOW slots accept window items and plants
    IF p_slot_id LIKE 'WINDOW%' THEN
        RETURN v_item_placement_type = 'window' OR v_item_category = 'plant';
    END IF;
    
    -- Default: allow placement
    RETURN TRUE;
END;
$$;

-- ============================================
-- Part 6: Room Placement Functions
-- ============================================

-- Function to place an item in a room slot
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
    v_item_record RECORD;
    v_ownership_record RECORD;
    v_existing_placement RECORD;
    v_room_config RECORD;
    v_new_placed_items JSONB;
BEGIN
    -- Step 1: Verify item exists and get details
    SELECT id, name, category, placement_type, image_url
    INTO v_item_record
    FROM public.items
    WHERE id = p_item_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;
    
    -- Step 2: Verify user owns the item
    SELECT id, is_placed, placed_slot_id
    INTO v_ownership_record
    FROM public.user_items
    WHERE user_id = p_user_id AND item_id = p_item_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'You do not own this item');
    END IF;
    
    -- Step 3: Validate placement type compatibility
    IF NOT public.validate_item_placement(p_item_id, p_slot_id) THEN
        RETURN json_build_object('success', false, 'error', 'This item cannot be placed in this slot type');
    END IF;
    
    -- Step 4: Get or create room config
    SELECT * INTO v_room_config
    FROM public.room_config
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        INSERT INTO public.room_config (user_id, placed_items)
        VALUES (p_user_id, '[]'::jsonb)
        RETURNING * INTO v_room_config;
    END IF;
    
    -- Step 5: Check if slot is already occupied by a different item
    SELECT * INTO v_existing_placement
    FROM jsonb_to_recordset(v_room_config.placed_items) AS x(item_id UUID, slot_id TEXT)
    WHERE slot_id = p_slot_id;
    
    IF FOUND AND v_existing_placement.item_id != p_item_id THEN
        RETURN json_build_object('success', false, 'error', 'This slot is already occupied. Remove the existing item first.');
    END IF;
    
    -- Step 6: Remove item from any previous slot (if moving)
    v_new_placed_items := (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements(v_room_config.placed_items) elem
        WHERE elem->>'item_id' != p_item_id::text
    );
    
    -- Step 7: Add item to new slot
    v_new_placed_items := v_new_placed_items || jsonb_build_object(
        'item_id', p_item_id,
        'slot_id', p_slot_id,
        'placed_at', NOW()
    );
    
    -- Step 8: Update room config
    UPDATE public.room_config
    SET placed_items = v_new_placed_items,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Step 9: Update user_items to mark as placed
    UPDATE public.user_items
    SET is_placed = TRUE,
        placed_slot_id = p_slot_id
    WHERE user_id = p_user_id AND item_id = p_item_id;
    
    RETURN json_build_object(
        'success', true,
        'slot_id', p_slot_id,
        'item_name', v_item_record.name
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to remove an item from a room slot
CREATE OR REPLACE FUNCTION public.remove_item_from_room(
    p_user_id UUID,
    p_item_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_room_config RECORD;
    v_new_placed_items JSONB;
    v_item_name TEXT;
BEGIN
    -- Get item name for response
    SELECT name INTO v_item_name FROM public.items WHERE id = p_item_id;
    
    -- Get room config
    SELECT * INTO v_room_config
    FROM public.room_config
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Room config not found');
    END IF;
    
    -- Remove item from placed_items
    v_new_placed_items := (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements(v_room_config.placed_items) elem
        WHERE elem->>'item_id' != p_item_id::text
    );
    
    -- Update room config
    UPDATE public.room_config
    SET placed_items = v_new_placed_items,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Update user_items to mark as not placed
    UPDATE public.user_items
    SET is_placed = FALSE,
        placed_slot_id = NULL
    WHERE user_id = p_user_id AND item_id = p_item_id;
    
    RETURN json_build_object(
        'success', true,
        'item_name', v_item_name
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to change wallpaper
CREATE OR REPLACE FUNCTION public.set_room_wallpaper(
    p_user_id UUID,
    p_wallpaper_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallpaper RECORD;
BEGIN
    -- Verify wallpaper exists and is a wallpaper type
    IF p_wallpaper_id IS NOT NULL THEN
        SELECT id, name, category INTO v_wallpaper
        FROM public.items
        WHERE id = p_wallpaper_id;
        
        IF NOT FOUND THEN
            RETURN json_build_object('success', false, 'error', 'Wallpaper not found');
        END IF;
        
        IF v_wallpaper.category != 'wallpaper' THEN
            RETURN json_build_object('success', false, 'error', 'Selected item is not a wallpaper');
        END IF;
        
        -- Verify user owns the wallpaper
        IF NOT EXISTS (
            SELECT 1 FROM public.user_items 
            WHERE user_id = p_user_id AND item_id = p_wallpaper_id
        ) THEN
            RETURN json_build_object('success', false, 'error', 'You do not own this wallpaper');
        END IF;
    END IF;
    
    -- Update or insert room config
    INSERT INTO public.room_config (user_id, wallpaper_id, placed_items, updated_at)
    VALUES (p_user_id, p_wallpaper_id, '[]'::jsonb, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET wallpaper_id = p_wallpaper_id,
        updated_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'wallpaper_name', v_wallpaper.name
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_item_placement(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.place_item_in_room(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_item_from_room(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_room_wallpaper(UUID, UUID) TO authenticated;
