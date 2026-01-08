/**
 * Bloom Dialogue Database
 * 
 * Curated conversation starters and response templates
 * organised by context and user state.
 */

export interface DialogueEntry {
  category: string;
  variations: string[];
}

// ============================================
// CONVERSATION STARTERS
// ============================================

export const morningGreetings: DialogueEntry = {
  category: 'morning_greeting',
  variations: [
    "Morning. What's the shape of today looking like?",
    "Hey—sleep okay? What's on your mind as the day starts?",
    "New day. Anything you're carrying over from yesterday, or starting fresh?",
    "Morning. What's one thing you're hoping to do today?",
    "Hey. How'd you wake up feeling?",
    "What's on the docket? Or are we figuring that out together?",
    "Morning. Any thoughts about what you want today to feel like?",
  ],
};

export const eveningReflections: DialogueEntry = {
  category: 'evening_reflection',
  variations: [
    "Day's wrapping up. How did it go?",
    "What's sitting with you from today?",
    "Anything happen today that surprised you?",
    "How are you feeling about how you spent your energy today?",
    "Before you wind down—anything you want to get out of your head?",
    "What's one thing from today you'd want to remember?",
    "Ready to call it? Or still processing?",
  ],
};

export const returningUserGreetings: DialogueEntry = {
  category: 'returning_user',
  variations: [
    "Hey, welcome back. Everything okay?",
    "Been a little while. What brought you back today?",
    "Good to see you. How have things been?",
    "I noticed you've been away. No pressure—just glad you're here.",
    "Back again. Anything you want to catch me up on?",
    "Hey. Take your time—I'm here when you're ready to chat.",
  ],
};

// ============================================
// REFLECTION PROMPTS
// ============================================

export const dailyReflectionPrompts: string[] = [
  "What's something that took effort today—whether or not it went well?",
  "Was there a moment today where you surprised yourself?",
  "What drained your energy today? What restored it?",
  "If you could do one thing differently tomorrow, what would it be?",
  "What's something small that went right today?",
  "Who or what are you grateful for right now?",
  "What did you learn about yourself today?",
  "What's one thing you did today that your past self would be proud of?",
  "Where did you show up for yourself today, even in a small way?",
  "What emotion showed up most today? What was it trying to tell you?",
];

export const valuesExplorationPrompts: string[] = [
  "What matters to you more than people might realise?",
  "When you're at your best, what values are you living?",
  "What kind of person do you want to be—not what do you want to achieve, but who?",
  "What would you regret not doing or becoming?",
  "What are you unwilling to compromise on?",
  "When have you felt most aligned with who you want to be?",
  "What would someone who knows you well say you care about most?",
];

export const goalExplorationPrompts: string[] = [
  "What's something you've been putting off that actually matters to you?",
  "What would change if you accomplished that goal? How would it feel?",
  "What's getting in the way right now? Not excuses—real barriers.",
  "What's the next small step you could take? Just one.",
  "What support would make this easier?",
  "What's your 'why' behind this goal? Keep asking 'why' until you hit something that moves you.",
  "If you knew you couldn't fail, what would you try?",
  "What are you willing to give up to make this happen?",
];

export const difficultEmotionPrompts: string[] = [
  "What's heavy right now? You don't have to solve it—just name it.",
  "What are you avoiding feeling? Sometimes naming it loosens its grip.",
  "If this emotion could talk, what would it be trying to tell you?",
  "What do you need right now that you're not getting?",
  "Where in your body do you feel this emotion? Can you stay with it for a moment?",
  "What would compassion toward yourself sound like right now?",
  "Who could you reach out to about this? Even just to be heard?",
];

// ============================================
// TRANSITION PHRASES
// ============================================

export const topicTransitions: string[] = [
  "Okay, let's shift gears for a second...",
  "Before we move on—anything else on that?",
  "That's a lot to sit with. Want to stay here or talk about something else?",
  "I'm curious about something else you mentioned earlier...",
  "We can come back to this. What else is on your mind?",
  "Is there something specific you want to dig into?",
];

export const deepeningPhrases: string[] = [
  "Say more about that.",
  "What's underneath that?",
  "Keep going—I'm listening.",
  "What do you mean when you say that?",
  "That feels important. Can we stay there?",
  "I'm curious what else is connected to that.",
  "There's something there. What is it?",
];

export const conversationClosings: string[] = [
  "That feels like a good place to pause. How are you feeling?",
  "We covered a lot. Anything you want to remember from this?",
  "Take care of yourself tonight. I'll be here.",
  "Rest up. We can pick this up whenever you want.",
  "Before you go—is there anything else sitting with you?",
  "I'm glad you shared that. See you next time.",
];

// ============================================
// HELPERS
// ============================================

/**
 * Get a random item from an array
 */
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get time-appropriate greeting
 */
export function getTimeBasedGreeting(daysSinceActive: number = 0): string {
  const hour = new Date().getHours();
  
  // If returning after being away, prioritise returning user greetings
  if (daysSinceActive > 1) {
    return getRandomItem(returningUserGreetings.variations);
  }
  
  // Time-based greetings
  if (hour >= 5 && hour < 12) {
    return getRandomItem(morningGreetings.variations);
  } else if (hour >= 17 || hour < 5) {
    return getRandomItem(eveningReflections.variations);
  }
  
  // Afternoon - use a neutral opener
  return "Hey. What's on your mind?";
}

/**
 * Get a random daily reflection prompt
 */
export function getDailyReflectionPrompt(): string {
  return getRandomItem(dailyReflectionPrompts);
}

/**
 * Get a random deepening phrase
 */
export function getDeepeningPhrase(): string {
  return getRandomItem(deepeningPhrases);
}

/**
 * Get a random conversation closing
 */
export function getConversationClosing(): string {
  return getRandomItem(conversationClosings);
}
