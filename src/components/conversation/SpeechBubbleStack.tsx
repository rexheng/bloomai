'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

interface SpeechBubbleStackProps {
  messages: Message[];
  isLoading?: boolean;
  maxVisible?: number;
}

/**
 * Stack of speech bubbles showing conversation history
 * Latest message is most prominent, older messages fade out
 */
export function SpeechBubbleStack({ 
  messages, 
  isLoading = false,
  maxVisible = 5 
}: SpeechBubbleStackProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const visibleMessages = messages.slice(-maxVisible);

  return (
    <div 
      ref={scrollRef}
      className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto scroll-smooth"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
      }}
    >
      {visibleMessages.map((message, index) => (
        <SpeechBubble 
          key={message.id || index}
          message={message}
          isLatest={index === visibleMessages.length - 1}
        />
      ))}
      
      {/* Loading indicator - playful typing dots */}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex justify-start">
          <div className="bg-gradient-to-br from-white to-sage-50 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-sage-100">
            <div className="flex gap-1.5 items-center">
              <span className="w-2.5 h-2.5 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 bg-sage-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 bg-sage-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SpeechBubbleProps {
  message: Message;
  isLatest?: boolean;
}

function SpeechBubble({ message, isLatest = false }: SpeechBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex animate-speech-bubble',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] px-4 py-2.5 shadow-md backdrop-blur-sm',
          isUser
            ? 'bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-2xl rounded-br-sm'
            : 'bg-gradient-to-br from-white to-sage-50 text-sage-800 rounded-2xl rounded-bl-sm border border-sage-100',
          isLatest && !isUser && 'ring-2 ring-sage-200/50'
        )}
      >
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}

