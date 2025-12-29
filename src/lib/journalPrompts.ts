export interface JournalPrompt {
  id: string;
  category: 'check-in' | 'gratitude' | 'goals' | 'reflection' | 'mood';
  text: string;
  followUps?: string[];
  pointsReward: number;
  icon: string;
}

// Morning prompts (6am - 12pm)
export const morningPrompts: JournalPrompt[] = [
  {
    id: 'morning-1',
    category: 'check-in',
    text: "Good morning! What's one thing you want to accomplish today?",
    followUps: ["What would make today a success?", "Any obstacles you anticipate?"],
    pointsReward: 15,
    icon: '☀️',
  },
  {
    id: 'morning-2',
    category: 'goals',
    text: "What are your top 3 priorities for today?",
    followUps: ["Which one feels most important?", "How will you tackle them?"],
    pointsReward: 20,
    icon: '🎯',
  },
  {
    id: 'morning-3',
    category: 'mood',
    text: "How are you feeling this morning?",
    followUps: ["What's contributing to that feeling?", "What do you need right now?"],
    pointsReward: 10,
    icon: '💭',
  },
  {
    id: 'morning-4',
    category: 'gratitude',
    text: "What's one thing you're looking forward to today?",
    pointsReward: 10,
    icon: '🙏',
  },
];

// Afternoon prompts (12pm - 6pm)
export const afternoonPrompts: JournalPrompt[] = [
  {
    id: 'afternoon-1',
    category: 'check-in',
    text: "How's your day going so far? Any wins to celebrate?",
    followUps: ["Even small wins count!", "What's next on your list?"],
    pointsReward: 15,
    icon: '🌤️',
  },
  {
    id: 'afternoon-2',
    category: 'reflection',
    text: "What's been the most interesting part of your day?",
    pointsReward: 15,
    icon: '✨',
  },
  {
    id: 'afternoon-3',
    category: 'mood',
    text: "Quick energy check! How are you feeling right now?",
    followUps: ["Need a break?", "What would help you recharge?"],
    pointsReward: 10,
    icon: '⚡',
  },
];

// Evening prompts (6pm - 10pm)
export const eveningPrompts: JournalPrompt[] = [
  {
    id: 'evening-1',
    category: 'reflection',
    text: "What went well today? Tell me about a win, big or small.",
    followUps: ["How did that make you feel?", "What helped you succeed?"],
    pointsReward: 20,
    icon: '🌙',
  },
  {
    id: 'evening-2',
    category: 'gratitude',
    text: "What are 3 things you're grateful for today?",
    followUps: ["Why do these stand out?", "Who made your day better?"],
    pointsReward: 20,
    icon: '🙏',
  },
  {
    id: 'evening-3',
    category: 'goals',
    text: "Did you accomplish what you wanted today? Let's reflect.",
    followUps: ["What will you carry into tomorrow?", "What would you do differently?"],
    pointsReward: 15,
    icon: '📝',
  },
  {
    id: 'evening-4',
    category: 'mood',
    text: "How are you winding down? What does your evening look like?",
    pointsReward: 10,
    icon: '🌃',
  },
];

// Weekend prompts
export const weekendPrompts: JournalPrompt[] = [
  {
    id: 'weekend-1',
    category: 'reflection',
    text: "It's the weekend! What are you doing for yourself today?",
    pointsReward: 15,
    icon: '🌈',
  },
  {
    id: 'weekend-2',
    category: 'gratitude',
    text: "What's been the highlight of your week?",
    pointsReward: 15,
    icon: '⭐',
  },
  {
    id: 'weekend-3',
    category: 'goals',
    text: "Any goals or intentions for the coming week?",
    pointsReward: 20,
    icon: '🚀',
  },
];

// Quick prompts for each mode
export const modePrompts: Record<string, JournalPrompt[]> = {
  'check-in': [
    { id: 'ci-1', category: 'check-in', text: "How are you today? What's on your mind?", pointsReward: 10, icon: '☀️' },
    { id: 'ci-2', category: 'check-in', text: "Let's do a quick check-in. How are you feeling?", pointsReward: 10, icon: '💬' },
  ],
  'gratitude': [
    { id: 'gr-1', category: 'gratitude', text: "What are 3 things you're grateful for right now?", pointsReward: 20, icon: '🙏' },
    { id: 'gr-2', category: 'gratitude', text: "Who made a positive impact on your day? Why?", pointsReward: 15, icon: '💝' },
  ],
  'goals': [
    { id: 'go-1', category: 'goals', text: "What's one goal you're working towards?", pointsReward: 15, icon: '🎯' },
    { id: 'go-2', category: 'goals', text: "What small step can you take today towards your dreams?", pointsReward: 15, icon: '🚀' },
  ],
  'mood': [
    { id: 'mo-1', category: 'mood', text: "How are you feeling on a scale of 1-5? Let's talk about it.", pointsReward: 10, icon: '💭' },
    { id: 'mo-2', category: 'mood', text: "What emotions are present for you right now?", pointsReward: 10, icon: '🌊' },
  ],
};

// Helper function to get prompts based on time of day
export function getTimeBasedPrompts(): JournalPrompt[] {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isWeekend) {
    return weekendPrompts;
  }

  if (hour >= 6 && hour < 12) {
    return morningPrompts;
  } else if (hour >= 12 && hour < 18) {
    return afternoonPrompts;
  } else {
    return eveningPrompts;
  }
}

// Get a single daily prompt (rotates based on date)
export function getDailyPrompt(): JournalPrompt {
  const prompts = getTimeBasedPrompts();
  const todayIndex = new Date().getDate() % prompts.length;
  return prompts[todayIndex];
}

// Get prompt for specific mode
export function getModePrompt(mode: 'check-in' | 'gratitude' | 'goals' | 'mood'): JournalPrompt {
  const prompts = modePrompts[mode];
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}
