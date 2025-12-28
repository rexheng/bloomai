'use client';

import { SendHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full max-w-2xl mx-auto"
    >
      <div className="relative flex-1 overflow-hidden rounded-full border border-input bg-background shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="w-full resize-none border-0 bg-transparent px-6 py-4 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0"
          style={{ minHeight: '56px' }}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 transition-colors',
            input.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'text-muted-foreground hover:bg-muted'
          )}
        >
          <SendHorizontal className="h-5 w-5" />
          <span className="sr-only">Send</span>
        </button>
      </div>
    </form>
  );
}
