'use client';

import { cn } from '@/lib/utils';

interface RoomBackgroundProps {
  wallpaperId?: string | null;
  className?: string;
}

/**
 * Background layer of the room
 * Renders wallpaper and wall structure
 */
export function RoomBackground({ wallpaperId, className }: RoomBackgroundProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-[1]',
        'overflow-hidden',
        className
      )}
    >
      {/* Wallpaper pattern */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-amber-50 via-amber-100/80 to-orange-100/60"
        style={{
          backgroundImage: wallpaperId
            ? `url(/items/wallpapers/${wallpaperId}.png)`
            : undefined,
          backgroundSize: 'cover',
        }}
      />

      {/* Wall texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(0,0,0,0.02) 40px,
              rgba(0,0,0,0.02) 41px
            )
          `,
        }}
      />

      {/* Corner shadow to create 3/4 view illusion */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, 
              transparent 0%, 
              transparent 45%, 
              rgba(0,0,0,0.03) 50%, 
              rgba(0,0,0,0.06) 100%
            )
          `,
        }}
      />

      {/* Window element */}
      <div className="absolute left-1/2 top-[15%] -translate-x-1/2 w-[20%] aspect-[3/4]">
        {/* Window frame */}
        <div className="absolute inset-0 bg-amber-800/30 rounded-t-lg border-4 border-amber-700/40">
          {/* Window glass */}
          <div className="absolute inset-2 rounded-t-sm bg-gradient-to-br from-sky-200 via-sky-100 to-amber-100 opacity-90">
            {/* Window shine */}
            <div className="absolute top-2 left-2 w-1/3 h-1/4 bg-white/40 rounded-sm" />
          </div>
          {/* Window divider */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-700/40" />
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-amber-700/40" />
        </div>
        {/* Windowsill */}
        <div className="absolute -bottom-2 -left-2 -right-2 h-3 bg-amber-200 rounded-sm shadow-sm border border-amber-300/50" />
      </div>

      {/* Warm light from window */}
      <div
        className="absolute left-[40%] top-[15%] w-[30%] h-[50%] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,248,220,0.8) 0%, transparent 70%)',
        }}
      />

      {/* Baseboard at bottom of walls */}
      <div className="absolute bottom-[35%] left-0 right-0 h-2 bg-amber-200/60" />
    </div>
  );
}
