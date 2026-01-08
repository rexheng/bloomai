/**
 * Dynamic User Context Builder
 * 
 * Generates contextual information to inject into Bloom's system prompt
 * for personalised, context-aware responses.
 */

interface UserProfile {
  current_streak?: number;
  total_points?: number;
  current_points?: number;
  last_active_date?: string;
  display_name?: string;
  unlocked_items?: string[];
  messages_sent?: number;
  xp?: number;
  level?: number;
}

interface SessionContext {
  messageCount: number;
  conversationStartTime?: Date;
}

/**
 * Calculate days since a given date
 */
function calculateDaysSince(dateString: string | undefined): number {
  if (!dateString) return 0;
  const lastActive = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActive.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get time of day category
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Build contextual user information for Bloom's prompt
 */
export function buildUserContext(user: UserProfile | null, session: SessionContext): string {
  if (!user) {
    return `
## Current User Context
- New or anonymous user
- Time of day: ${getTimeOfDay()}
`;
  }

  const daysSinceActive = calculateDaysSince(user.last_active_date);
  const recentUnlocks = user.unlocked_items?.slice(0, 3) || [];
  
  let context = `
## Current User Context
- Name: ${user.display_name || 'Friend'}
- Streak: ${user.current_streak || 0} days
- Total points: ${user.total_points || 0}
- This is message ${session.messageCount + 1} in this conversation
- Time of day: ${getTimeOfDay()}`;

  // Add returning user context if applicable
  if (daysSinceActive > 1) {
    context += `\n- Returning after ${daysSinceActive} days away`;
  }

  // Add recent unlocks if any
  if (recentUnlocks.length > 0) {
    context += `\n- Recently unlocked: ${recentUnlocks.join(', ')}`;
  }

  // Add level info if available
  if (user.level && user.level > 1) {
    context += `\n- Level: ${user.level}`;
  }

  context += `

Use this context naturally when relevant, but don't force it. The relationship matters more than the gamification. Don't constantly mention streaks or points—only acknowledge them if the user brings them up or when genuinely celebrating a milestone.`;

  return context;
}

export default buildUserContext;
