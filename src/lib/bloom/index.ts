/**
 * Bloom Dialogue System
 * 
 * Psychology-informed AI companion framework for wellness conversations.
 */

export { default as bloomSystemPrompt } from './system-prompt';
export { default as buildUserContext } from './build-context';
export { 
  default as handlePotentialCrisis,
  detectCrisis,
  getCrisisResponse,
  type CrisisCheckResult
} from './safety';
export {
  morningGreetings,
  eveningReflections,
  returningUserGreetings,
  dailyReflectionPrompts,
  valuesExplorationPrompts,
  goalExplorationPrompts,
  difficultEmotionPrompts,
  topicTransitions,
  deepeningPhrases,
  conversationClosings,
  getTimeBasedGreeting,
  getDailyReflectionPrompt,
  getDeepeningPhrase,
  getConversationClosing,
} from './dialogue-database';
