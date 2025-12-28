'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { createClient } from '@/lib/supabase/client';
import { Scoreboard } from '../gamification/Scoreboard';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: Message[];
}

export function ChatInterface({ conversationId: initialConvId, initialMessages = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);

    // 1. Optimistic Update
    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);

    try {
        let currentConvId = conversationId;

        // 2. Create conversation if not exists
            // 2. Create conversation if not exists
        if (!currentConvId) {
             const res = await fetch('/api/conversations', {
                 method: 'POST',
                 body: JSON.stringify({ title: content.slice(0, 30) })
             });
             if (res.ok) {
                 const conv = await res.json();
                 currentConvId = conv.id;
                 setConversationId(conv.id);
             }
        }

      // 3. Call Chat API
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

      // 4. Handle Streaming Response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = '';
      
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

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
      // Optional: Add error message to UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full gap-4">
       {/* Main Chat Area */}
       <div className="flex-1 flex flex-col h-full relative rounded-2xl overflow-hidden bg-white/40 shadow-sm border border-sage-100">
          <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground mt-20">
                    <p>Start a conversation with Bloom...</p>
                </div>
            )}
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
                 <div className="flex w-full items-start gap-4 p-4 flex-row animate-pulse">
                    <div className="flex h-8 w-8 shrink-0 rounded-full bg-sage-100"></div>
                    <div className="h-10 bg-sage-50 rounded-2xl w-24"></div>
                 </div>
            )}
          </div>

          <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            <div className="text-center mt-2">
                <p className="text-xs text-muted-foreground">Bloom can make mistakes. Consider checking important information.</p>
            </div>
          </div>
       </div>

       {/* Sidebar for Gamification */}
       <div className="w-80 hidden md:block space-y-4">
           <Scoreboard />
           {/* Placeholder for Room/Visuals */}
           <div className="h-64 bg-sage-50/50 rounded-2xl border border-sage-200 border-dashed flex items-center justify-center text-sage-400 text-sm">
               Your Room (Coming Soon)
           </div>
       </div>
    </div>
  );
}
