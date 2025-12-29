-- ============================================
-- BLOOM COMPANION DATABASE SETUP
-- Run this script in Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/dhuqusxnbacbodzsefrb/sql
-- ============================================

-- ============================================
-- PART 1: PROFILE CREATION TRIGGER
-- ============================================

-- Create the trigger function for new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    avatar_url,
    total_points,
    current_points,
    current_streak,
    longest_streak,
    xp,
    level,
    messages_sent,
    is_premium,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Bloom Explorer'),
    NEW.raw_user_meta_data->>'avatar_url',
    0,  -- total_points
    0,  -- current_points
    0,  -- current_streak
    0,  -- longest_streak
    0,  -- xp
    1,  -- level (start at level 1)
    0,  -- messages_sent
    FALSE,  -- is_premium
    NOW(),
    NOW()
  );
  
  -- Also create a default room configuration for the new user
  INSERT INTO public.room_config (
    user_id,
    placed_items,
    updated_at
  )
  VALUES (
    NEW.id,
    '[]'::jsonb,
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile and room_config for new users on signup';

-- ============================================
-- PART 2: SEED SHOP ITEMS
-- ============================================

-- Clear existing items (optional - remove if you want to preserve existing)
-- DELETE FROM public.items;

-- Insert shop items
INSERT INTO public.items (name, description, category, point_cost, image_url, rarity) VALUES
  -- Plants (4 items)
  ('Succulent', 'A charming little desert plant that thrives on neglect. Perfect for busy bloomers!', 'plant', 50, '/items/succulent.png', 'common'),
  ('Fern', 'Lush, leafy fern that adds a touch of forest magic to your space.', 'plant', 100, '/items/fern.png', 'common'),
  ('Monstera', 'The trendy monstera with its iconic split leaves. A true statement piece!', 'plant', 150, '/items/monstera.png', 'uncommon'),
  ('Sunflower', 'A bright, cheerful sunflower that follows the light. Radiates positivity!', 'plant', 200, '/items/sunflower.png', 'rare'),
  
  -- Furniture (4 items)
  ('Cozy Chair', 'A comfortable desk chair for those long reflection sessions.', 'furniture', 75, '/items/chair.png', 'common'),
  ('Warm Lamp', 'A soft, warm desk lamp that creates the perfect ambiance.', 'furniture', 100, '/items/lamp.png', 'common'),
  ('Soft Rug', 'A plush floor rug that makes your space feel like home.', 'furniture', 125, '/items/rug.png', 'uncommon'),
  ('Bookshelf', 'A filled bookshelf brimming with stories and wisdom.', 'furniture', 200, '/items/bookshelf.png', 'rare')

ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check items were seeded
SELECT COUNT(*) as item_count FROM public.items;

-- Check trigger was created
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
