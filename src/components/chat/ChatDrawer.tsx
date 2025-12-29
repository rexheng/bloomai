'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatInterface } from './ChatInterface';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  initialMessages?: any[];
  journalMode?: 'check-in' | 'gratitude' | 'goals' | 'mood' | 'free';
  initialPrompt?: string;
}

export function ChatDrawer({
  isOpen,
  onClose,
  conversationId,
  initialMessages = [],
  journalMode = 'free',
  initialPrompt,
}: ChatDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modeLabels = {
    'check-in': '☀️ Daily Check-in',
    'gratitude': '🙏 Gratitude Log',
    'goals': '🎯 Goal Review',
    'mood': '💭 Mood Check',
    'free': '💬 Chat with Bloom',
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-out",
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 top-12 rounded-t-3xl",
          // Desktop: centered modal
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:w-[700px] md:h-[80vh] md:max-h-[700px] md:rounded-2xl",
          isOpen ? "translate-y-0" : "translate-y-full md:translate-y-[100vh]"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Chat with Bloom"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sage-100 bg-sage-50/50 rounded-t-3xl md:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">{modeLabels[journalMode].split(' ')[0]}</span>
            <h2 className="font-semibold text-sage-800">
              {modeLabels[journalMode].split(' ').slice(1).join(' ')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sage-100 rounded-full transition-colors text-sage-600 hover:text-sage-800"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Content */}
        <div className="h-[calc(100%-56px)] overflow-hidden">
          <ChatInterface
            conversationId={conversationId}
            initialMessages={initialMessages}
            journalMode={journalMode}
            initialPrompt={initialPrompt}
          />
        </div>

        {/* Drag handle for mobile */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-sage-300 rounded-full md:hidden" />
      </div>
    </>
  );
}
