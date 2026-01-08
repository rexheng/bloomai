'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { RoomProvider, useRoom } from '@/lib/room';
import { RoomBackground } from './RoomBackground';
import { RoomMidground } from './RoomMidground';
import { RoomForeground } from './RoomForeground';
import { BloomCharacter } from '@/components/character/BloomCharacter';
import { ConversationOverlay } from '@/components/conversation/ConversationOverlay';
import { RoomHUD } from '@/components/hud/RoomHUD';
import { ShopModal } from '@/components/shop/ShopModal';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { InventoryItem } from '@/types/database';

interface VirtualRoomProps {
  className?: string;
  conversationId?: string;
  initialMessages?: any[];
  onSignOut?: () => void;
}

/**
 * Main container component for the virtual room
 * Orchestrates all room layers and provides room context
 */
function VirtualRoomContent({ className, conversationId, initialMessages = [], onSignOut }: VirtualRoomProps) {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  
  const [pointsUpdateTrigger, setPointsUpdateTrigger] = useState(0);
  
  const { 
    roomConfig, 
    avatarState, 
    setAvatarState,
    isConversationOpen, 
    openConversation, 
    closeConversation,
    isPlacementMode,
    setPlacementMode,
    setItemToPlace,
    refreshRoomConfig
  } = useRoom();

  const handleAvatarTap = () => {
    openConversation();
  };

  const handleAvatarHover = (isHovered: boolean) => {
    if (!isConversationOpen) {
      setAvatarState(isHovered ? 'attention' : 'idle');
    }
  };

  const handleSelectItemForPlacement = useCallback((item: InventoryItem) => {
    // Map InventoryItem (snake_case) to ItemToPlace (camelCase)
    setItemToPlace({
      id: item.id,
      spriteId: item.sprite_id,
      category: item.category,
      placementType: item.placement_type,
      size: item.size,
      name: item.name,
      imageUrl: item.image_url
    });
    setPlacementMode(true);
    setIsInventoryOpen(false);
  }, [setItemToPlace, setPlacementMode]);

  const handlePurchaseComplete = useCallback(() => {
    // Refresh room config in case something changed
    refreshRoomConfig();
    // Trigger points update
    setPointsUpdateTrigger(prev => prev + 1);
  }, [refreshRoomConfig]);

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden',
        'bg-gradient-to-b from-sky-100 to-amber-50',
        className
      )}
    >
      {/* Room Layers */}
      <RoomBackground wallpaperId={roomConfig.wallpaperId} />
      <RoomMidground />
      <RoomForeground />

      {/* Room dim overlay when conversation is open */}
      {isConversationOpen && (
        <div 
          className="absolute inset-0 bg-black/20 z-[25] pointer-events-none transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Placement mode overlay */}
      {isPlacementMode && (
        <div 
          className="absolute inset-0 bg-sage-900/10 z-[24] pointer-events-none transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Bloom Avatar - positioned in midground center */}
      <div 
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-[30]"
        onMouseEnter={() => handleAvatarHover(true)}
        onMouseLeave={() => handleAvatarHover(false)}
      >
        <BloomCharacter
          mood={avatarState === 'celebrating' ? 'happy' : avatarState === 'sleepy' ? 'sleepy' : 'happy'}
          isGreeting={!isConversationOpen}
          onTap={handleAvatarTap}
          size="lg"
          isInRoom={true}
          isActive={isConversationOpen}
        />
      </div>

      {/* Conversation Overlay */}
      <ConversationOverlay
        isOpen={isConversationOpen}
        onClose={closeConversation}
        conversationId={conversationId}
        initialMessages={initialMessages}
      />

      {/* HUD */}
      <RoomHUD 
        onShopOpen={() => setIsShopOpen(true)}
        onInventoryOpen={() => setIsInventoryOpen(true)}
        onSignOut={onSignOut}
        streak={0}
        pointsUpdateTrigger={pointsUpdateTrigger}
      />

      {/* Shop Modal */}
      <ShopModal 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />

      {/* Inventory Panel */}
      <InventoryPanel
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        onSelectItemForPlacement={handleSelectItemForPlacement}
        isPlacementMode={isPlacementMode}
      />
    </div>
  );
}

export function VirtualRoom(props: VirtualRoomProps) {
  return (
    <RoomProvider>
      <VirtualRoomContent {...props} />
    </RoomProvider>
  );
}
