'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { SpeechBubbleStack } from './SpeechBubbleStack';
import { FloatingInput } from './FloatingInput';
import { PromptBubbles } from './PromptBubbles';
import { useRoom } from '@/lib/room';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  initialMessages?: Message[];
}

/**
 * Conversation overlay that appears when user taps on avatar
 * Room remains visible but dimmed behind
 */
export function ConversationOverlay({
  isOpen,
  onClose,
  conversationId: initialConvId,
  initialMessages = [],
}: ConversationOverlayProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const { setAvatarState } = useRoom();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking on the overlay itself, not the content
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

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

  // Update avatar state based on conversation
  useEffect(() => {
    if (isOpen) {
      setAvatarState(isLoading ? 'listening' : 'speaking');
    } else {
      setAvatarState('idle');
    }
  }, [isOpen, isLoading, setAvatarState]);

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);
    setAvatarState('listening');

    // Optimistic update
    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);

    try {
      let currentConvId = conversationId;

      // Create conversation if not exists
      if (!currentConvId) {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          body: JSON.stringify({ title: content.slice(0, 30) }),
        });
        if (res.ok) {
          const conv = await res.json();
          currentConvId = conv.id;
          setConversationId(conv.id);
        }
      }

      // Call Chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId: currentConvId,
        }),
      });

      if (!response.ok) throw new Error(response.statusText);
      if (!response.body) throw new Error('No response body');

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      setAvatarState('speaking');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiMessageContent += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'assistant') {
            lastMsg.content = aiMessageContent;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={cn(
        'fixed inset-0 z-[50]',
        'flex flex-col items-center justify-end',
        'pointer-events-auto',
        'animate-fade-in'
      )}
      onClick={handleOverlayClick}
    >
      {/* Prompt bubbles when no messages yet */}
      {messages.length === 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[35%] w-full max-w-md px-4 pointer-events-auto">
          <PromptBubbles onSelectPrompt={handleSendMessage} disabled={isLoading} />
        </div>
      )}

      {/* Speech bubbles positioned above avatar */}
      {messages.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[38%] w-full max-w-md px-4 pointer-events-auto">
          <SpeechBubbleStack messages={messages} isLoading={isLoading} />
        </div>
      )}

      {/* Floating input at bottom */}
      <div className="w-full max-w-lg px-4 pb-4 pointer-events-auto">
        <FloatingInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
