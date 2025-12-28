-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  current_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  messages_sent INTEGER DEFAULT 0,
  last_active_date DATE,
  is_premium BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation threads
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Available items catalogue
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('plant', 'furniture', 'wallpaper', 'accessory')),
  point_cost INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  is_premium_only BOOLEAN DEFAULT FALSE,
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's unlocked items
CREATE TABLE public.user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- User's room configuration
CREATE TABLE public.room_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  wallpaper_id UUID REFERENCES public.items(id),
  placed_items JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log for point calculations
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (synced from Stripe)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT,
  plan_type TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  TO authenticated 
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  TO authenticated 
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id);

-- Conversations: Users can CRUD their own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT 
  TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE 
  TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

-- Messages: Users can access messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON public.messages
  FOR SELECT 
  TO authenticated 
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in own conversations" ON public.messages
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = (SELECT auth.uid())
    )
  );

-- Items catalogue: All authenticated users can view items
CREATE POLICY "Anyone can view items" ON public.items
  FOR SELECT 
  TO authenticated 
  USING (true);

-- User items: Users can view/manage their own unlocked items
CREATE POLICY "Users can view own items" ON public.user_items
  FOR SELECT 
  TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can unlock items" ON public.user_items
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Room config: Users can view/update their own room
CREATE POLICY "Users can view own room" ON public.room_config
  FOR SELECT 
  TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own room" ON public.room_config
  FOR UPDATE 
  TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create room config" ON public.room_config
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Activity log: Users can view their own activity
CREATE POLICY "Users can view own activity" ON public.activity_log
  FOR SELECT 
  TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "System can insert activity" ON public.activity_log
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Subscriptions: Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT 
  TO authenticated 
  USING ((SELECT auth.uid()) = user_id);
