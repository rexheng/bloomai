'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PointsDisplay } from '@/components/gamification/PointsDisplay';
import { ShopModal } from '@/components/shop/ShopModal';
import { ShoppingBag, Menu, X } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<any[]>([]);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    const checkUser = async () => {
      let currentUser = null;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUser = user;
      } else if (process.env.NODE_ENV === 'development') {
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

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-sage-50 text-sage-900 font-sans">
        <main className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
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

  return (
    <div className="flex h-screen bg-sage-50 overflow-hidden">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg text-sage-800">Bloom</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-sage-100 rounded-full">
                            <X size={20} className="text-sage-600" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <PointsDisplay variant="full" />
                        <div className="h-px bg-sage-200 my-4" />
                        <div className="space-y-2">
                            <div 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 bg-sage-100 rounded-lg text-sage-900 font-medium cursor-pointer"
                            >
                                Chat
                            </div>
                            <div 
                                onClick={() => {
                                    setIsShopOpen(true);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="p-2 hover:bg-sage-100 rounded-lg text-sage-700 cursor-pointer flex items-center gap-2 transition-colors"
                            >
                                <ShoppingBag size={18} />
                                <span>Garden Shop</span>
                            </div>
                            <div className="p-2 hover:bg-sage-50 rounded-lg text-sage-500 cursor-not-allowed">Room (Coming Soon)</div>
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} className="text-sm text-sage-500 hover:text-sage-800 w-full text-left p-2 hover:bg-sage-50 rounded">Sign Out</button>
                    </div>
                </div>
            </div>
        )}

        {/* Sidebar (Desktop) */}
        <div className="hidden md:flex flex-col w-64 bg-white border-r border-sage-200 p-4">
            <h2 className="font-bold text-lg mb-4 text-sage-800">Bloom</h2>
            <div className="space-y-4">
                <PointsDisplay variant="full" />
                <div className="h-px bg-sage-200 my-4" />
                <div className="space-y-2">
                    <div className="p-2 bg-sage-100 rounded-lg text-sage-900 font-medium cursor-pointer">Chat</div>
                    <div 
                        onClick={() => setIsShopOpen(true)}
                        className="p-2 hover:bg-sage-100 rounded-lg text-sage-700 cursor-pointer flex items-center gap-2 transition-colors"
                    >
                        <ShoppingBag size={18} />
                        <span>Garden Shop</span>
                    </div>
                    <div className="p-2 hover:bg-sage-50 rounded-lg text-sage-500 cursor-not-allowed">Room (Coming Soon)</div>
                </div>
            </div>
            <div className="mt-auto">
                 <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} className="text-sm text-sage-500 hover:text-sage-800">Sign Out</button>
            </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col w-full">
            <header className="h-14 border-b bg-white/50 flex items-center px-4 md:px-6 justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button 
                        className="md:hidden p-1 -ml-2 hover:bg-sage-100 rounded-full text-sage-600"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-medium text-sage-900">Your Companion</span>
                </div>
                <span className="text-sm text-sage-500 hidden sm:inline">Streak: 0 days</span>
            </header>
            <div className="flex-1 overflow-hidden relative">
                <ChatInterface 
                    key={conversationId} // Remount when history is loaded
                    conversationId={conversationId} 
                    initialMessages={messages} 
                />
            </div>
        </div>
        <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
    </div>
  );
}
