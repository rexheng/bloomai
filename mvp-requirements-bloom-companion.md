# MVP Requirements Document: Bloom Companion

## Product Overview

### Vision
A gamified web-based productivity and journalling application where users chat with an AI companion about their daily accomplishments. Engagement unlocks virtual decorative items (plants, furniture, wallpapers) to customise their virtual space, creating a rewarding feedback loop that encourages consistent self-reflection and goal tracking.

### Core Value Proposition
Transform mundane daily journalling into an engaging, rewarding experience where users feel validated for their accomplishments whilst building a personalised virtual sanctuary.

### Target Audience
- Young professionals (18-35) seeking productivity tools
- Journalling enthusiasts wanting a more engaging experience
- Users who enjoy cosy/casual games and virtual decoration
- Individuals seeking gentle accountability and encouragement

### Tech Stack
| Component | Technology | Version/Notes |
|-----------|------------|---------------|
| Frontend | Next.js | v14+ (App Router recommended) |
| Backend/Database | Supabase | Latest |
| Authentication | Supabase Auth | Built-in with RLS |
| AI Chat | Gemini API | `@google/genai` SDK, `gemini-2.5-flash` model |
| Payments | Stripe | `stripe` npm package |
| Hosting | Vercel/Netlify | Edge-optimised |

### Key Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@google/genai": "^1.x",
    "stripe": "^14.x",
    "next": "^14.x",
    "react": "^18.x"
  }
}
```

---

## Core Features (MVP Scope)

### 1. AI Chat Companion

**Description**: The heart of the application—an AI-powered companion that users chat with about their day, accomplishments, goals, and feelings.

**Functional Requirements**:
- Users can send text messages to the AI companion
- AI responds with contextually appropriate encouragement, validation, and suggestions
- Conversation history persists across sessions
- AI remembers user context within a conversation thread
- AI personality is warm, supportive, and gently motivating
- Response latency under 3 seconds

**AI Behaviour Guidelines**:
- Celebrate accomplishments (big and small)
- Provide constructive suggestions without being preachy
- Ask follow-up questions to encourage deeper reflection
- Recognise patterns in user behaviour over time
- Maintain consistent personality and tone
- Never be dismissive or judgemental

**Gemini API Integration**:
- Use Gemini 2.0 Flash for cost-effective, fast responses
- Implement system prompt defining companion personality
- Pass relevant conversation history for context
- Include user's unlocked items/progress in context for personalised responses

### 2. Progression & Unlockables System

**Description**: Gamification layer that rewards user engagement with virtual items.

**Currency System**:
- **Bloom Points**: Primary currency earned through engagement
- Points are non-purchasable (earned only through activity)

**Earning Mechanics**:
| Action | Points Earned |
|--------|---------------|
| Daily check-in (first message of day) | 10 points |
| Completing a reflection prompt | 15 points |
| Logging an accomplishment | 20 points |
| 7-day streak bonus | 50 points |
| 30-day streak bonus | 200 points |

**Unlockable Categories**:
1. **Plants** (5-10 items for MVP)
   - Small succulents (50 points)
   - Potted ferns (100 points)
   - Flowering plants (150 points)
   - Rare/exotic plants (300 points)

2. **Furniture** (5-10 items for MVP)
   - Basic desk items (75 points)
   - Cosy accessories (125 points)
   - Feature furniture (200 points)

3. **Wallpapers/Backgrounds** (5-8 for MVP)
   - Simple patterns (100 points)
   - Scenic views (175 points)
   - Animated backgrounds (250 points)

4. **Companion Accessories** (3-5 for MVP)
   - Hats/accessories for the AI avatar (150 points)

**Functional Requirements**:
- Display current point balance prominently
- Show progress towards next unlock
- Notification when new item is unlockable
- Items persist permanently once unlocked

### 3. Virtual Room/Space

**Description**: A customisable virtual space where users display their unlocked items.

**Functional Requirements**:
- Default starting room with basic decoration
- Drag-and-drop item placement
- Save room configuration per user
- Preview items before purchasing
- Switch between unlocked wallpapers
- Room visible during chat sessions (split view or background)

**MVP Scope Limitations**:
- Single room only (no multiple rooms)
- Fixed furniture placement slots (not free-form)
- 2D/illustrated style (not 3D)

### 4. User Authentication & Profiles

**Description**: Secure user accounts with persistent progress.

**Functional Requirements**:
- Email/password registration and login
- Google OAuth integration
- Password reset functionality
- User profile with:
  - Display name
  - Avatar selection
  - Join date
  - Total points earned
  - Current streak
  - Longest streak
- Account deletion capability (GDPR compliance)

**Supabase Auth Implementation**:
- Use Supabase Auth for all authentication
- Row Level Security (RLS) on all user data
- Session management via Supabase client

### Supabase Client Setup

```javascript
// lib/supabase.js - Browser client
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// lib/supabase-admin.js - Server-side admin client (for webhooks, etc.)
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
// WARNING: Never expose service_role_key in browser!
```

### 5. Streak & Engagement Tracking

**Description**: Track user consistency to encourage daily use.

**Functional Requirements**:
- Daily streak counter (consecutive days with at least one chat)
- Streak displayed prominently in UI
- Grace period: streak maintained if user returns within 48 hours (optional, discuss)
- Streak milestones with bonus rewards
- "Streak freeze" item purchasable with points (preserves streak for 1 day)

### 6. Premium Features (Stripe Integration)

**Description**: Optional paid tier for enhanced features.

**Free Tier Includes**:
- Unlimited chat messages
- Basic progression system
- All unlockable items (earnable)
- Single room customisation
- 7-day conversation history

**Premium Tier ($4.99/month or $39.99/year)**:
- Unlimited conversation history
- Exclusive premium-only items (cosmetic only)
- Advanced AI features:
  - Weekly progress summaries
  - Goal tracking integration
  - Mood pattern analysis
- Priority AI response times
- Early access to new items
- Ad-free experience (if ads added later)

**Stripe Integration Requirements**:
- Stripe Checkout for subscription signup
- Stripe Customer Portal for subscription management
- Webhook handling for subscription events
- Grace period handling for failed payments
- Subscription status synced to Supabase

---

## Database Schema (Supabase)

### Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  current_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
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
```

### Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- BEST PRACTICE: Wrap auth.uid() in SELECT for performance (94% improvement)
-- BEST PRACTICE: Add explicit NULL check for unauthenticated requests
-- BEST PRACTICE: Always specify role with TO clause

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
```

### Client-Side Query Best Practice

Even with RLS, always add explicit filters for better performance:

```javascript
// Good: Explicit filter + RLS
const { data } = await supabase
  .from('conversations')
  .select()
  .eq('user_id', userId);

// Avoid: Relying on RLS alone (less performant)
const { data } = await supabase
  .from('conversations')
  .select();
```

---

## API Endpoints

### Authentication (Supabase Auth)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login existing user
- `POST /auth/logout` - Logout user
- `POST /auth/reset-password` - Request password reset
- `GET /auth/user` - Get current user

### Chat
- `POST /api/chat` - Send message, receive AI response
- `GET /api/conversations` - List user's conversations
- `GET /api/conversations/:id/messages` - Get messages in conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Items & Shop
- `GET /api/items` - List all available items
- `GET /api/items/unlocked` - List user's unlocked items
- `POST /api/items/:id/unlock` - Unlock item with points

### Room
- `GET /api/room` - Get user's room configuration
- `PUT /api/room` - Update room configuration

### Profile & Progress
- `GET /api/profile` - Get user profile and stats
- `PUT /api/profile` - Update profile settings
- `GET /api/activity` - Get activity history

### Payments (Stripe)
- `POST /api/stripe/create-checkout` - Create Stripe Checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/stripe/portal` - Get Stripe Customer Portal URL

---

## User Flows

### 1. New User Onboarding
1. User lands on homepage
2. Clicks "Get Started"
3. Creates account (email or Google)
4. Brief onboarding tutorial (skippable):
   - Introduces AI companion
   - Explains points system
   - Shows customisation preview
5. First chat interaction with companion
6. Earns first points
7. Shown first unlockable item

### 2. Daily Engagement Flow
1. User opens app
2. Sees streak counter and daily check-in prompt
3. Chats with companion about their day
4. Points awarded for engagement
5. Notification if new item unlockable
6. Optionally customises room with new items

### 3. Item Unlock Flow
1. User accumulates sufficient points
2. Notification appears: "New item available!"
3. User visits shop/catalogue
4. Previews item in room
5. Confirms unlock (points deducted)
6. Item added to inventory
7. Prompted to place in room

### 4. Premium Upgrade Flow
1. User clicks "Upgrade to Premium"
2. Redirected to Stripe Checkout
3. Completes payment
4. Webhook updates subscription status
5. Premium features immediately available
6. Confirmation email sent

---

## UI/UX Requirements

### Design Principles
- **Cosy & Calming**: Soft colours, rounded corners, gentle animations
- **Encouraging**: Positive microcopy, celebratory moments
- **Non-Overwhelming**: Progressive disclosure, clean layouts
- **Accessible**: WCAG 2.1 AA compliance

### Key Screens (MVP)

1. **Landing/Marketing Page**
   - Hero section with value proposition
   - Feature highlights
   - Testimonials (placeholder for MVP)
   - CTA to sign up

2. **Dashboard/Main View**
   - Split view: Room on left, Chat on right (desktop)
   - Stacked view on mobile (chat primary, room toggle)
   - Streak counter visible
   - Points balance visible
   - Quick access to shop

3. **Chat Interface**
   - Clean message bubbles
   - Typing indicator during AI response
   - Timestamp on messages
   - Suggested prompts for new users

4. **Shop/Catalogue**
   - Grid view of items by category
   - Filter by category/rarity
   - Locked/unlocked states clear
   - Point cost prominently displayed
   - Preview functionality

5. **Room Customisation**
   - Visual room editor
   - Inventory sidebar
   - Drag-and-drop or slot-based placement
   - Save/reset options

6. **Profile/Settings**
   - Account details
   - Stats display
   - Subscription management
   - Privacy settings
   - Logout/delete account

### Visual Style Guide
- **Primary Colour**: Soft sage green (#8FBC8F)
- **Secondary Colour**: Warm cream (#FFF8DC)
- **Accent Colour**: Coral pink (#F08080)
- **Typography**: Friendly sans-serif (e.g., Inter, Nunito)
- **Illustrations**: Soft, hand-drawn style

---

## Gemini API Integration Details

### SDK & Model Selection

**Recommended SDK**: `@google/genai` (latest unified SDK)
**Recommended Model**: `gemini-2.5-flash` (fast, cost-effective for chat)

```bash
npm install @google/genai
```

### System Instruction Template

```
You are Bloom, a warm and supportive AI companion in a productivity journalling app. Your role is to:

1. CELEBRATE the user's accomplishments, no matter how small
2. ENCOURAGE reflection on their day and goals
3. ASK thoughtful follow-up questions
4. SUGGEST gentle improvements without being preachy
5. REMEMBER context from the conversation

Your personality:
- Warm and friendly, like a supportive friend
- Gently enthusiastic, not over-the-top
- Non-judgemental and accepting
- Curious about the user's life
- Occasionally playful but always respectful

Guidelines:
- Keep responses concise (2-4 sentences typically)
- Use encouraging language
- Avoid giving unsolicited advice
- Never dismiss or minimise user's feelings
- If user seems stressed, prioritise empathy over productivity

User's current progress:
- Current streak: {streak} days
- Total points: {points}
- Recently unlocked: {recent_items}

Remember: You're here to make journalling feel rewarding, not like a chore.
```

### JavaScript SDK Implementation (Recommended)

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// For multi-turn chat with streaming (recommended for UX)
async function sendMessage(conversationHistory, userMessage, systemInstruction) {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    systemInstruction: systemInstruction,
    history: conversationHistory.map(msg => ({
      role: msg.role, // 'user' or 'model'
      parts: [{ text: msg.content }]
    }))
  });

  // Streaming response for better UX
  const stream = await chat.sendMessageStream({
    message: userMessage
  });

  let fullResponse = "";
  for await (const chunk of stream) {
    fullResponse += chunk.text;
    // Optionally send chunks to client via SSE/WebSocket
  }

  return fullResponse;
}

// For simple non-streaming requests
async function generateContent(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}
```

### REST API Alternative (if not using SDK)

```javascript
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
        topP: 0.9
      }
    })
  }
);

const data = await response.json();
const reply = data.candidates[0].content.parts[0].text;
```

---

## Stripe Integration Details

### Products & Prices
- **Product**: Bloom Companion Premium
- **Prices**:
  - Monthly: $4.99/month (price_xxx)
  - Annual: $39.99/year (price_yyy)

### Server-Side Implementation (Node.js)

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session for new subscription
async function createCheckoutSession(customerId, priceId, returnUrl) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}/cancelled`,
  });
  
  return session;
}

// Create Customer Portal Session for subscription management
async function createPortalSession(customerId, returnUrl) {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return portalSession;
}

// Create Customer and Subscription together
async function createSubscription(customerInfo, priceId) {
  // 1. Create or fetch the customer
  const customer = await stripe.customers.create({
    email: customerInfo.email,
    name: customerInfo.name,
  });

  // 2. Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    expand: ['latest_invoice.payment_intent'],
  });

  return { customer, subscription };
}
```

### API Route Example (Next.js)

```javascript
// pages/api/create-checkout-session.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { priceId, customerId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// pages/api/customer-portal.js
export default async function handler(req, res) {
  const { customerId } = req.body;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/account`,
  });

  res.redirect(303, portalSession.url);
}
```

### Webhook Events to Handle
- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_failed` - Payment failed
- `invoice.payment_succeeded` - Payment successful

### Webhook Handler Example

```javascript
// pages/api/webhooks/stripe.js
import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: session.client_reference_id,
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          status: 'active',
        });
      
      await supabase
        .from('profiles')
        .update({ 
          is_premium: true,
          stripe_customer_id: session.customer 
        })
        .eq('id', session.client_reference_id);
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id);
      
      await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('stripe_customer_id', subscription.customer);
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', invoice.customer);
      break;
    }
  }

  res.json({ received: true });
}
```

### Subscription Status Mapping
| Stripe Status | App Behaviour |
|---------------|---------------|
| `active` | Full premium access |
| `past_due` | Premium access with warning |
| `cancelled` | Premium until period end |
| `unpaid` | Revert to free tier |

---

## Success Metrics (MVP)

### Primary Metrics
- **Daily Active Users (DAU)**: Target 100+ within first month
- **7-Day Retention**: Target 40%+
- **30-Day Retention**: Target 20%+
- **Messages per Session**: Target 5+

### Secondary Metrics
- Free to Premium Conversion Rate: Target 5%
- Average Session Duration: Target 5+ minutes
- Items Unlocked per User: Target 10+ in first month
- Streak Maintenance Rate: Target 30% maintain 7+ day streaks

### Tracking Implementation
- Supabase for core metrics (messages, sessions, unlocks)
- Consider Mixpanel/PostHog for detailed analytics (post-MVP)

---

## MVP Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Foundation** | Week 1-2 | Auth, database schema, basic UI scaffold |
| **Phase 2: Core Chat** | Week 3-4 | Gemini integration, chat UI, conversation persistence |
| **Phase 3: Gamification** | Week 5-6 | Points system, items, unlock mechanics |
| **Phase 4: Room** | Week 7 | Room customisation, item placement |
| **Phase 5: Payments** | Week 8 | Stripe integration, premium features |
| **Phase 6: Polish** | Week 9-10 | Testing, bug fixes, optimisation |

**Total Estimated MVP Timeline: 10 weeks**

---

## Out of Scope (Post-MVP)

- Mobile native apps (iOS/Android)
- Social features (friends, sharing rooms)
- Multiple rooms/spaces
- Advanced AI features (voice, image generation)
- Achievements/badges system
- Seasonal events and limited-time items
- User-generated content
- Habit tracking integration
- Export/import data
- Multi-language support

---

## Open Questions for Discussion

1. **Naming**: "Bloom Companion" is a working title—final name TBD?
2. **AI Personality**: Should users be able to choose companion personality types?
3. **Monetisation Balance**: Is cosmetic-only premium acceptable, or should there be functional differences?
4. **Streak Forgiveness**: Should there be a grace period or streak freeze mechanic?
5. **Content Moderation**: How to handle inappropriate user messages?
6. **Data Retention**: How long to store conversation history for free users?

---

## Appendix: Competitor Analysis

| App | Strengths | Weaknesses | Our Differentiation |
|-----|-----------|------------|---------------------|
| **Finch** | Cute pet, gamification | Limited AI interaction | Deeper AI conversations |
| **Reflectly** | Strong journalling | No gamification | Visual rewards system |
| **Habitica** | Great gamification | Complex, overwhelming | Simpler, cosier experience |
| **Replika** | Advanced AI | No productivity focus | Goal-oriented conversations |

---

*Document Version: 1.1*  
*Last Updated: December 2024*  
*Status: Draft for Review*  
*API Documentation Verified: Supabase, Stripe, Gemini (via Context7)*
