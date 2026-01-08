'use client';

import { useState } from 'react';
import { Menu, X, ShoppingBag, Settings, LogOut, Package, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PointsDisplay } from '@/components/gamification/PointsDisplay';
import { useRoom } from '@/lib/room';

interface RoomHUDProps {
  onShopOpen?: () => void;
  onInventoryOpen?: () => void;
  onSignOut?: () => void;
  streak?: number;
  pointsUpdateTrigger?: number;
}

/**
 * Minimal HUD overlay for the room
 * Shows points, streak, and menu access
 */
export function RoomHUD({ onShopOpen, onInventoryOpen, onSignOut, streak = 0, pointsUpdateTrigger = 0 }: RoomHUDProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setPlacementMode, isPlacementMode, itemToPlace, setItemToPlace } = useRoom();

  const handleExitPlacement = () => {
    setPlacementMode(false);
    setItemToPlace(null);
  };

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="flex items-center justify-between p-4">
          {/* Points display */}
          <div className="pointer-events-auto">
            <PointsDisplay variant="minimal" refreshTrigger={pointsUpdateTrigger} />
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-sage-200 pointer-events-auto">
            <span className="text-orange-500">🔥</span>
            <span className="text-sm font-medium text-sage-700">{streak}</span>
          </div>

          {/* Menu toggle */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-sage-200 hover:bg-sage-50 transition-colors pointer-events-auto"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-sage-600" />
          </button>
        </div>
      </div>

      {/* Placement Mode Indicator */}
      {isPlacementMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <div className="bg-sage-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
            <Grid3X3 size={18} />
            <span className="text-sm font-medium">
              {itemToPlace 
                ? `Placing: ${itemToPlace.name}` 
                : 'Select a slot to place items'}
            </span>
            <button
              onClick={handleExitPlacement}
              className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Menu overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl animate-drawer-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-sage-100">
              <h2 className="font-semibold text-sage-800">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 hover:bg-sage-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X size={20} className="text-sage-600" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              <button
                onClick={() => {
                  onShopOpen?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-sage-50 transition-colors text-sage-700"
              >
                <ShoppingBag size={18} />
                <span>Garden Shop</span>
              </button>

              <button
                onClick={() => {
                  onInventoryOpen?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-sage-50 transition-colors text-sage-700"
              >
                <Package size={18} />
                <span>My Inventory</span>
              </button>

              <button
                onClick={() => {
                  setPlacementMode(!isPlacementMode);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full p-3 rounded-lg transition-colors",
                  isPlacementMode ? "bg-sage-100 text-sage-800" : "hover:bg-sage-50 text-sage-700"
                )}
              >
                <Grid3X3 size={18} />
                <span>{isPlacementMode ? 'Exit Decoration Mode' : 'Decorate Room'}</span>
              </button>

              <div className="h-px bg-sage-100 my-4" />

              <button
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-sage-50 transition-colors text-sage-500"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  onSignOut?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-50 transition-colors text-red-500"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
