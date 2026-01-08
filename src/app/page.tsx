'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { VirtualRoom } from '@/components/room/VirtualRoom';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      let currentUser = null;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUser = user;
      } else {
        // DEV BYPASS: Use hardcoded user for development
        console.warn("Using Dev Bypass User ID");
        currentUser = { 
            id: 'fd998a0a-e068-4fef-af1a-d10267318f9b', 
            email: 'rexheng@gmail.com',
            user_metadata: { full_name: 'Rex (Dev)' } 
        };
      }
      setUser(currentUser);
      
      if (currentUser) {
          // Fetch latest conversation
          try {
              const convRes = await fetch('/api/conversations');
              if (convRes.ok) {
                  const conversations = await convRes.json();
                  if (conversations && conversations.length > 0) {
                      const lastConv = conversations[0];
                      setConversationId(lastConv.id);

                      // Fetch messages
                      const msgRes = await fetch(`/api/messages?conversationId=${lastConv.id}`);
                      if (msgRes.ok) {
                          const msgs = await msgRes.json();
                          setMessages(msgs);
                      }
                  }
              }
          } catch (err) {
              console.error("Error loading chat history:", err);
          }
      }

      setLoading(false);
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-sky-100 to-amber-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
          <p className="text-sage-600 font-medium">Loading your room...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-sky-100 via-amber-50 to-sage-50 text-sage-900 font-sans">
        <main className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🌱</div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-sage-800">
              Bloom Companion
            </h1>
            <p className="text-xl max-w-lg mx-auto text-sage-600 leading-relaxed">
              Your cosy space for productivity, reflection, and growth. <br/>
              Chat with your AI companion, track your daily wins, and build your digital sanctuary.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
             <a 
                href="/login"
                className="px-8 py-3 bg-white border border-sage-200 text-sage-800 rounded-full hover:bg-sage-50 transition-all font-medium min-w-[140px] shadow-sm hover:shadow-md"
             >
                Log In
             </a>
             <a 
                href="/signup"
                className="px-8 py-3 bg-sage-600 text-white rounded-full hover:bg-sage-700 transition-all font-medium min-w-[140px] shadow-sm hover:shadow-md hover:scale-105"
             >
                Sign Up
             </a>
          </div>
          
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-sage-600 opacity-80">
            <div className="p-4">
                <div className="text-2xl mb-2">🌱</div>
                <h3 className="font-semibold mb-1">Track Growth</h3>
                <p className="text-sm">Log your daily accomplishments and watch your garden grow.</p>
            </div>
             <div className="p-4">
                <div className="text-2xl mb-2">💬</div>
                <h3 className="font-semibold mb-1">AI Companion</h3>
                <p className="text-sm">Reflect on your day with an empathetic AI friend.</p>
            </div>
             <div className="p-4">
                <div className="text-2xl mb-2">🏡</div>
                <h3 className="font-semibold mb-1">Decorate</h3>
                <p className="text-sm">Unlock rewards and customize your virtual room.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Logged in: Show the virtual room
  return (
    <div className="h-screen w-screen overflow-hidden">
      <VirtualRoom
        conversationId={conversationId}
        initialMessages={messages}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
