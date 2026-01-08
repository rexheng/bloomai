'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Floating input field for conversation
 * Appears at bottom of screen over room background
 */
export function FloatingInput({
  onSend,
  disabled = false,
  placeholder = 'Talk to Bloom...',
}: FloatingInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when mounted
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'relative flex items-center gap-2',
        'bg-gradient-to-br from-white/95 to-sage-50/90 backdrop-blur-md',
        'rounded-full shadow-lg border border-sage-100',
        'px-4 py-2.5',
        'transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-sage-300/60 focus-within:shadow-xl focus-within:border-sage-200'
      )}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'flex-1 bg-transparent outline-none',
          'text-sage-800 placeholder:text-sage-400',
          'text-sm md:text-base',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Message input"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className={cn(
          'p-2 rounded-full transition-all duration-200',
          'text-sage-500 hover:text-sage-700 hover:bg-sage-100',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-400',
          (disabled || !value.trim()) && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-sage-500'
        )}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
