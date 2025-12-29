-- Profile Creation Trigger
-- Automatically creates a profile row when a new user signs up via Supabase Auth

-- Create the trigger function
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
