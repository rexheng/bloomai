'use client';

import { cn } from '@/lib/utils';
import { PlacementSlot } from './PlacementSlot';

interface RoomForegroundProps {
  className?: string;
}

/**
 * Foreground layer - closest to camera
 * Contains floor, rug, and floor-level items
 */
export function RoomForeground({ className }: RoomForegroundProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-[20]',
        'pointer-events-none',
        className
      )}
    >
      {/* Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[38%] overflow-hidden">
        {/* Floor base color */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-200 to-amber-300/80" />
        
        {/* Wood floor pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 48px,
                rgba(139,69,19,0.15) 48px,
                rgba(139,69,19,0.15) 50px
              ),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 8px,
                rgba(139,69,19,0.08) 8px,
                rgba(139,69,19,0.08) 9px
              )
            `,
          }}
        />

        {/* Perspective lines to create depth */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom, 
                rgba(0,0,0,0.05) 0%, 
                transparent 30%
              )
            `,
          }}
        />
      </div>

      {/* Rug (center floor) */}
      <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[35%] h-[18%]">
        <div className="absolute inset-0 bg-sage-300/70 rounded-lg shadow-sm">
          {/* Rug pattern */}
          <div className="absolute inset-[8%] border-2 border-sage-400/50 rounded-md" />
          <div className="absolute inset-[15%] border border-sage-200/40 rounded" />
          {/* Rug fringe (top and bottom) */}
          <div className="absolute -top-1 left-[5%] right-[5%] h-1 bg-sage-200/60 rounded-t" />
          <div className="absolute -bottom-1 left-[5%] right-[5%] h-1 bg-sage-200/60 rounded-b" />
        </div>
      </div>

      {/* Floor placement slots */}
      <div className="absolute left-[3%] bottom-[5%] w-[18%] h-[22%] pointer-events-auto">
        <PlacementSlot slotId="FLOOR-L" />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[3%] w-[22%] h-[16%] pointer-events-auto">
        <PlacementSlot slotId="FLOOR-C" />
      </div>
      <div className="absolute right-[3%] bottom-[5%] w-[18%] h-[22%] pointer-events-auto">
        <PlacementSlot slotId="FLOOR-R" />
      </div>

      {/* Ambient shadows */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
    </div>
  );
}
