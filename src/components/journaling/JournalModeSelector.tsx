'use client';

import { cn } from '@/lib/utils';

type JournalMode = 'check-in' | 'gratitude' | 'goals' | 'mood' | 'free';

interface JournalModeSelectorProps {
  onSelectMode: (mode: JournalMode) => void;
  className?: string;
}

const modes: { id: JournalMode; icon: string; label: string; description: string }[] = [
  { id: 'check-in', icon: '☀️', label: 'Check-in', description: 'Daily reflection' },
  { id: 'gratitude', icon: '🙏', label: 'Gratitude', description: 'What you appreciate' },
  { id: 'goals', icon: '🎯', label: 'Goals', description: 'Track progress' },
  { id: 'mood', icon: '💭', label: 'Mood', description: 'How you feel' },
  { id: 'free', icon: '💬', label: 'Chat', description: 'Free conversation' },
];

export function JournalModeSelector({ onSelectMode, className }: JournalModeSelectorProps) {
  return (
    <div className={cn("w-full max-w-lg mx-auto", className)}>
      <div className="flex flex-wrap justify-center gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={cn(
              "group flex flex-col items-center gap-1 p-3 rounded-2xl",
              "bg-white/60 hover:bg-white/90 backdrop-blur-sm",
              "border border-sage-200 hover:border-sage-400",
              "transition-all duration-200 hover:scale-105 hover:shadow-md",
              "min-w-[70px] md:min-w-[80px]"
            )}
            aria-label={`${mode.label}: ${mode.description}`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {mode.icon}
            </span>
            <span className="text-xs font-medium text-sage-700 group-hover:text-sage-900">
              {mode.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact version for mobile
export function JournalModeSelectorCompact({ onSelectMode, className }: JournalModeSelectorProps) {
  return (
    <div className={cn("flex justify-center gap-4 overflow-x-auto py-2 px-4", className)}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelectMode(mode.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap",
            "bg-white/80 hover:bg-white backdrop-blur-sm",
            "border border-sage-200 hover:border-sage-400",
            "transition-all duration-200 hover:scale-105 shadow-sm"
          )}
        >
          <span className="text-lg">{mode.icon}</span>
          <span className="text-sm font-medium text-sage-700">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
