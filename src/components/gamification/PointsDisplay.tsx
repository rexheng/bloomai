'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface PointsDisplayProps {
  initialPoints?: number;
  initialStreak?: number;
  variant?: 'minimal' | 'full';
  refreshTrigger?: number;
}

export function PointsDisplay({ initialPoints = 0, initialStreak = 0, variant = 'full', refreshTrigger = 0 }: PointsDisplayProps) {
  const [points, setPoints] = useState(initialPoints);
  const [streak, setStreak] = useState(initialStreak);
  const [loading, setLoading] = useState(true);

  // Fetch points on mount
  useEffect(() => {
    const fetchPoints = async () => {
       try {
           // We can reuse the daily checkin logic or just a GET endpoint? 
           // For now let's assume parent passes initial or we hit checkin safely.
           // Actually, let's hit checkin to ensure up to date.
           const res = await fetch('/api/points', {
               method: 'POST',
               body: JSON.stringify({ action: 'daily_checkin' })
           });
           if (res.ok) {
               const data = await res.json();
               setPoints(data.points);
               setStreak(data.streak);
           }
       } catch (e) {
           console.error("Failed to sync points", e);
       } finally {
           setLoading(false);
       }
    };
    
    // Only fetch if we suspect stale or need init
    fetchPoints();
  }, [refreshTrigger]);

  if (variant === 'minimal') {
      return (
          <div className="flex items-center gap-2 text-sm font-medium text-sage-700 bg-white/50 px-3 py-1 rounded-full border border-sage-200">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>{points}</span>
          </div>
      );
  }

  return (
    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-sage-200 shadow-sm">
      <div className="flex flex-col items-center min-w-[60px]">
         <span className="text-xs text-sage-500 uppercase tracking-wider font-semibold">Streak</span>
         <div className="flex items-center gap-1 text-sage-800 font-bold text-lg">
            <span>🔥</span>
            <span>{streak}</span>
         </div>
      </div>
      <div className="h-8 w-px bg-sage-200" />
      <div className="flex flex-col items-center min-w-[80px]">
          <span className="text-xs text-sage-500 uppercase tracking-wider font-semibold">Points</span>
          <div className="flex items-center gap-1 text-sage-800 font-bold text-lg">
             <motion.div
                key={points}
                initial={{ scale: 1.2, color: '#eab308' }}
                animate={{ scale: 1, color: '#1f2937' }}
                className="flex items-center gap-1"
             >
                <Sparkles className="w-4 h-4 text-yellow-500" />
                {points}
             </motion.div>
          </div>
      </div>
    </div>
  );
}
