/**
 * Crisis Detection & Safety Handling
 * 
 * Handles potential crisis situations with appropriate resources
 * and ensures user safety is prioritised.
 */

const CRISIS_RESPONSE = `I'm really glad you're talking to me, and I want to make sure you're safe. What you're describing sounds serious.

I'm not able to provide the support you need right now—but there are people who can. If you're in crisis:
- **UK**: Samaritans at 116 123 (free, 24/7)
- **US**: 988 Suicide & Crisis Lifeline
- **Singapore**: Samaritans of Singapore at 1-767
- **International**: findahelpline.com

You don't have to go through this alone. Would it be okay to reach out to one of these resources, or is there someone in your life you could call?`;

// Regex patterns for crisis indicators
const CRISIS_PATTERNS = [
  /hurt\s+(myself|me)/i,
  /kill\s+(myself|me)/i,
  /suicide/i,
  /end\s+(it|my\s+life)/i,
  /don'?t\s+want\s+to\s+(be\s+here|live|exist)/i,
  /no\s+point\s+(in|to)\s+(living|life)/i,
  /want\s+to\s+die/i,
  /better\s+off\s+(dead|without\s+me)/i,
  /can'?t\s+go\s+on/i,
  /self[- ]?harm/i,
];

export interface CrisisCheckResult {
  isCrisis: boolean;
  response?: string;
  skipNormalProcessing: boolean;
}

/**
 * Check if a message contains crisis indicators
 */
export function detectCrisis(message: string): boolean {
  return CRISIS_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Handle potential crisis situation
 * Returns crisis response if detected, otherwise indicates normal processing
 */
export async function handlePotentialCrisis(
  message: string, 
  userId?: string
): Promise<CrisisCheckResult> {
  const isCrisis = detectCrisis(message);

  if (isCrisis) {
    // Log crisis event for safety monitoring (if applicable)
    if (userId) {
      await logCrisisEvent(userId, message);
    }

    return {
      isCrisis: true,
      response: CRISIS_RESPONSE,
      skipNormalProcessing: true,
    };
  }

  return {
    isCrisis: false,
    skipNormalProcessing: false,
  };
}

/**
 * Log crisis event for safety monitoring
 * In production, this should integrate with your monitoring/alerting system
 */
async function logCrisisEvent(userId: string, message: string): Promise<void> {
  // Log to console in development
  console.warn(`[SAFETY] Crisis indicators detected for user ${userId}`);
  console.warn(`[SAFETY] Message preview: ${message.substring(0, 50)}...`);
  
  // In production, you would:
  // 1. Log to a secure database table
  // 2. Potentially trigger alerts to safety team
  // 3. Track for follow-up support
}

/**
 * Get the crisis response message
 */
export function getCrisisResponse(): string {
  return CRISIS_RESPONSE;
}

export default handlePotentialCrisis;
