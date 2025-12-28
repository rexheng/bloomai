'use client';

import { motion } from 'framer-motion';
import { Trophy, MessageCircle, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ScoreboardProps {
  initialMessages?: number;
  initialXp?: number;
  initialLevel?: number;
}

export function Scoreboard({ initialMessages = 0, initialXp = 0, initialLevel = 1 }: ScoreboardProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [xp, setXp] = useState(initialXp);
  const [level, setLevel] = useState(initialLevel);
  const supabase = createClient();

  useEffect(() => {
    // Poll for updates or subscribe to realtime events
    // For MVP, polling or refetching on specific triggers is safer than Realtime channel complexity
    // But since we are inside a chat, we could listen to a global event or valid context.
    
    // Let's implement a simple poller for now to ensure stats sync after chatting
    const interval = setInterval(async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         const { data } = await supabase
            .from('profiles')
            .select('messages_sent, xp, level')
            .eq('id', user.id)
            .single();
            
         if (data) {
             setMessages(data.messages_sent || 0);
             setXp(data.xp || 0);
             setLevel(data.level || 1);
         }
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [supabase]);

  // Calculate progress to next level
  const xpForNextLevel = level * 100;
  const xpForCurrentLevel = (level - 1) * 100;
  const progress = Math.min(100, Math.max(0, ((xp - xpForCurrentLevel) / 100) * 100));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sage-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
         <h3 className="text-sm font-semibold text-sage-600 uppercase tracking-wider">Companion Stats</h3>
         <Trophy className="w-4 h-4 text-yellow-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="bg-sage-50 p-2 rounded-xl flex flex-col items-center">
              <span className="text-xs text-sage-400">Level</span>
              <span className="text-2xl font-bold text-sage-800">{level}</span>
          </div>
          <div className="bg-sage-50 p-2 rounded-xl flex flex-col items-center">
               <span className="text-xs text-sage-400">Messages</span>
               <span className="text-2xl font-bold text-sage-800">{messages}</span>
          </div>
      </div>

      <div className="space-y-1">
          <div className="flex justify-between text-xs text-sage-500">
              <span>XP Progress</span>
              <span>{xp} / {xpForNextLevel}</span>
          </div>
          <div className="h-2 bg-sage-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-sage-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
          </div>
      </div>
    </div>
  );
}
