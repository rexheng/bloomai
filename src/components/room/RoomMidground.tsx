'use client';

import { cn } from '@/lib/utils';
import { useRoom } from '@/lib/room';
import { PlacementSlot } from './PlacementSlot';

interface RoomMidgroundProps {
  className?: string;
}

/**
 * Midground layer - primary interaction zone
 * Contains shelf, desk, and the avatar anchor position
 */
export function RoomMidground({ className }: RoomMidgroundProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-[10]',
        'pointer-events-none',
        className
      )}
    >
      {/* Shelf unit (left side) */}
      <div className="absolute left-[5%] top-[25%] w-[22%] h-[45%] pointer-events-auto">
        {/* Shelf back */}
        <div className="absolute inset-0 bg-amber-100/80 rounded-lg shadow-inner border border-amber-200/60" />
        
        {/* Shelf levels */}
        <div className="absolute left-0 right-0 top-[30%] h-1.5 bg-amber-200 shadow-sm" />
        <div className="absolute left-0 right-0 top-[55%] h-1.5 bg-amber-200 shadow-sm" />
        <div className="absolute left-0 right-0 top-[80%] h-1.5 bg-amber-200 shadow-sm" />
        
        {/* Shelf frame */}
        <div className="absolute inset-0 border-4 border-amber-300/60 rounded-lg pointer-events-none" />

        {/* Placement slots for shelves - positioned inside the shelf */}
        <div className="absolute left-[10%] top-[5%] w-[80%] h-[23%]">
          <PlacementSlot slotId="SHELF-T" />
        </div>
        <div className="absolute left-[10%] top-[32%] w-[80%] h-[21%]">
          <PlacementSlot slotId="SHELF-M" />
        </div>
        <div className="absolute left-[10%] top-[57%] w-[80%] h-[21%]">
          <PlacementSlot slotId="SHELF-B" />
        </div>
      </div>

      {/* Desk (right side) */}
      <div className="absolute right-[5%] top-[30%] w-[38%] h-[30%] pointer-events-auto">
        {/* Desk surface */}
        <div className="absolute inset-x-0 top-0 h-[40%] bg-amber-100 rounded-t-lg shadow-md border border-amber-200/60">
          {/* Desk surface grain texture */}
          <div className="absolute inset-0 opacity-20 rounded-t-lg"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 2px,
                  rgba(139,69,19,0.1) 2px,
                  rgba(139,69,19,0.1) 3px
                )
              `,
            }}
          />
        </div>
        
        {/* Desk front panel */}
        <div className="absolute inset-x-0 top-[38%] bottom-0 bg-amber-200/80 rounded-b-lg border-x border-b border-amber-300/50" />
        
        {/* Desk drawer */}
        <div className="absolute left-[10%] right-[10%] top-[50%] h-[35%] bg-amber-100 rounded border border-amber-300/40">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-2 bg-amber-400/60 rounded-full" />
        </div>

        {/* Desk surface placement slots */}
        <div className="absolute left-[5%] top-[5%] w-[28%] h-[30%]">
          <PlacementSlot slotId="DESK-L" />
        </div>
        <div className="absolute left-[36%] top-[5%] w-[28%] h-[30%]">
          <PlacementSlot slotId="DESK-C" />
        </div>
        <div className="absolute right-[5%] top-[5%] w-[24%] h-[30%]">
          <PlacementSlot slotId="DESK-R" />
        </div>
      </div>

      {/* Chair (in front of desk, implied seating) */}
      <div className="absolute right-[18%] top-[62%] w-[12%] aspect-square pointer-events-none">
        {/* Chair back */}
        <div className="absolute left-[15%] right-[15%] top-0 h-[50%] bg-sage-400/80 rounded-t-lg border border-sage-500/40" />
        {/* Chair seat */}
        <div className="absolute inset-x-0 top-[45%] h-[40%] bg-sage-500/80 rounded-lg shadow-sm border border-sage-600/40" />
        {/* Chair legs (implied) */}
        <div className="absolute left-[20%] bottom-0 w-[15%] h-[25%] bg-amber-700/60 rounded-b" />
        <div className="absolute right-[20%] bottom-0 w-[15%] h-[25%] bg-amber-700/60 rounded-b" />
      </div>

      {/* Wall placement slots */}
      <div className="absolute left-[8%] top-[5%] w-[14%] aspect-[4/5] pointer-events-auto">
        <PlacementSlot slotId="WALL-L1" />
      </div>
      <div className="absolute left-[24%] top-[3%] w-[14%] aspect-[4/5] pointer-events-auto">
        <PlacementSlot slotId="WALL-L2" />
      </div>
      <div className="absolute right-[24%] top-[3%] w-[14%] aspect-[4/5] pointer-events-auto">
        <PlacementSlot slotId="WALL-R1" />
      </div>
      <div className="absolute right-[8%] top-[5%] w-[14%] aspect-[4/5] pointer-events-auto">
        <PlacementSlot slotId="WALL-R2" />
      </div>

      {/* Window sill placement */}
      <div className="absolute left-[42%] top-[38%] w-[16%] h-[8%] pointer-events-auto">
        <PlacementSlot slotId="WINDOW" />
      </div>

      {/* Avatar adjacent slot */}
      <div className="absolute left-[52%] top-[48%] w-[10%] h-[12%] pointer-events-auto">
        <PlacementSlot slotId="AVATAR-SIDE" />
      </div>
    </div>
  );
}
