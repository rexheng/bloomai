'use client';

import { cn } from '@/lib/utils';

interface PromptBubblesProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPT_SUGGESTIONS = [
  { emoji: '✨', text: "What made you smile today?", category: 'gratitude' },
  { emoji: '🌱', text: "How are you really doing?", category: 'check-in' },
  { emoji: '💭', text: "Got anything on your mind?", category: 'open' },
  { emoji: '🎯', text: "Any small wins today?", category: 'goals' },
  { emoji: '😌', text: "What's your energy like?", category: 'mood' },
  { emoji: '🌟', text: "What are you proud of lately?", category: 'reflection' },
];

/**
 * Fun, playful prompt bubble chips for conversation starters
 * Appears when conversation is empty to help users get started
 */
export function PromptBubbles({ onSelectPrompt, disabled = false }: PromptBubblesProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 animate-fade-in">
      {/* Bloom's greeting */}
      <div className="text-center mb-2">
        <p className="text-sage-600 text-sm">
          Hey! 👋 What's up?
        </p>
      </div>

      {/* Prompt chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {PROMPT_SUGGESTIONS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt.text)}
            disabled={disabled}
            className={cn(
              'group relative',
              'px-3 py-2 rounded-full',
              'bg-white/90 backdrop-blur-sm',
              'border border-sage-200 shadow-sm',
              'text-sm text-sage-700',
              'transition-all duration-200 ease-out',
              'hover:bg-sage-50 hover:border-sage-300 hover:shadow-md',
              'hover:scale-105 hover:-translate-y-0.5',
              'active:scale-95',
              'animate-bubble-pop',
              disabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0'
            )}
            style={{
              animationDelay: `${index * 80}ms`,
            }}
          >
            <span className="mr-1.5">{prompt.emoji}</span>
            <span>{prompt.text}</span>
          </button>
        ))}
      </div>

      {/* Subtle hint */}
      <p className="text-xs text-sage-400 mt-2">
        Tap one, or just say hi~
      </p>
    </div>
  );
}
