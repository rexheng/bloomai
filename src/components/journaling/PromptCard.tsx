'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JournalPrompt, getTimeBasedPrompts } from '@/lib/journalPrompts';

interface PromptCardProps {
  onSelectPrompt: (prompt: JournalPrompt) => void;
  className?: string;
}

export function PromptCard({ onSelectPrompt, className }: PromptCardProps) {
  const prompts = getTimeBasedPrompts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPrompt = prompts[currentIndex];

  const nextPrompt = () => {
    setCurrentIndex((prev) => (prev + 1) % prompts.length);
  };

  const prevPrompt = () => {
    setCurrentIndex((prev) => (prev - 1 + prompts.length) % prompts.length);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'check-in': 'bg-amber-100 text-amber-700',
      'gratitude': 'bg-pink-100 text-pink-700',
      'goals': 'bg-blue-100 text-blue-700',
      'reflection': 'bg-purple-100 text-purple-700',
      'mood': 'bg-teal-100 text-teal-700',
    };
    return colors[category] || 'bg-sage-100 text-sage-700';
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sage-200 p-5 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sage-100/50 to-transparent rounded-bl-full" />
        
        {/* Category badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            "text-xs font-medium px-3 py-1 rounded-full capitalize",
            getCategoryColor(currentPrompt.category)
          )}>
            {currentPrompt.icon} {currentPrompt.category.replace('-', ' ')}
          </span>
          <div className="flex items-center gap-1 text-xs text-sage-500">
            <Sparkles size={12} />
            <span>+{currentPrompt.pointsReward} pts</span>
          </div>
        </div>

        {/* Prompt text */}
        <p className="text-sage-800 text-lg font-medium leading-relaxed mb-4 min-h-[3rem]">
          {currentPrompt.text}
        </p>

        {/* Navigation and action */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={prevPrompt}
              className="p-2 hover:bg-sage-100 rounded-full text-sage-500 hover:text-sage-700 transition-colors"
              aria-label="Previous prompt"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextPrompt}
              className="p-2 hover:bg-sage-100 rounded-full text-sage-500 hover:text-sage-700 transition-colors"
              aria-label="Next prompt"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex gap-1.5">
            {prompts.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === currentIndex ? "bg-sage-600 w-3" : "bg-sage-300"
                )}
              />
            ))}
          </div>

          <button
            onClick={() => onSelectPrompt(currentPrompt)}
            className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium rounded-full transition-all hover:scale-105 shadow-sm"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
