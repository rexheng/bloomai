'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { PlacementSlot, PLACEMENT_SLOTS, canPlaceInSlot } from './PlacementSlotMap';
import { InventoryItem, RoomConfigWithDetails, PlacedItemEntry } from '@/types/database';

/**
 * Placed item in the room (enhanced with full item details)
 */
export interface PlacedItem {
  itemId: string;
  slotId: string;
  itemType: string;
  imageUrl?: string;
  name?: string;
  category?: string;
}

export interface ItemToPlace {
  id: string;
  spriteId: string;
  category: string;
  placementType: string;
  size: string;
  name: string;
  imageUrl: string;
}

/**
 * Room configuration state
 */
export interface RoomConfig {
  wallpaperId: string | null;
  placedItems: PlacedItem[];
}

/**
 * Avatar state for visual feedback
 */
export type AvatarState = 'idle' | 'attention' | 'speaking' | 'listening' | 'celebrating' | 'sleepy';

/**
 * Room context value
 */
interface RoomContextValue {
  // Room configuration
  roomConfig: RoomConfig;
  setRoomConfig: (config: RoomConfig) => void;
  isLoading: boolean;
  
  // Placement mode
  isPlacementMode: boolean;
  setPlacementMode: (mode: boolean) => void;
  selectedSlot: PlacementSlot | null;
  setSelectedSlot: (slot: PlacementSlot | null) => void;
  
  // Item being dragged/placed
  itemToPlace: ItemToPlace | null;
  setItemToPlace: (item: ItemToPlace | null) => void;
  
  // Avatar state
  avatarState: AvatarState;
  setAvatarState: (state: AvatarState) => void;
  
  // Conversation state
  isConversationOpen: boolean;
  openConversation: () => void;
  closeConversation: () => void;
  
  // Helper functions
  getPlacedItemForSlot: (slotId: string) => PlacedItem | undefined;
  placeItem: (slotId: string, item: ItemToPlace) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  setWallpaper: (wallpaperId: string | null) => Promise<boolean>;
  refreshRoomConfig: () => Promise<void>;
  getAvailableSlots: (itemCategory?: string, placementType?: string) => PlacementSlot[];
}

const RoomContext = createContext<RoomContextValue | null>(null);

interface RoomProviderProps {
  children: ReactNode;
  initialConfig?: RoomConfig;
}

const defaultConfig: RoomConfig = {
  wallpaperId: null,
  placedItems: [],
};

export function RoomProvider({ children, initialConfig = defaultConfig }: RoomProviderProps) {
  const [roomConfig, setRoomConfig] = useState<RoomConfig>(initialConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacementMode, setPlacementMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<PlacementSlot | null>(null);
  const [itemToPlace, setItemToPlace] = useState<ItemToPlace | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isConversationOpen, setConversationOpen] = useState(false);

  // Fetch room configuration on mount
  const refreshRoomConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/room');
      
      if (res.ok) {
        const data: RoomConfigWithDetails = await res.json();
        
        // Transform to local format
        const placedItems: PlacedItem[] = (data.placed_items_details || []).map(p => ({
          itemId: p.item_id,
          slotId: p.slot_id,
          itemType: p.item?.category || 'unknown',
          imageUrl: p.item?.image_url,
          name: p.item?.name,
          category: p.item?.category
        }));
        
        setRoomConfig({
          wallpaperId: data.wallpaper_id,
          placedItems
        });
      }
    } catch (err) {
      console.error('Failed to load room config:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRoomConfig();
  }, [refreshRoomConfig]);

  const openConversation = useCallback(() => {
    setConversationOpen(true);
    setAvatarState('speaking');
    // Exit placement mode when opening conversation
    setPlacementMode(false);
    setSelectedSlot(null);
    setItemToPlace(null);
  }, []);

  const closeConversation = useCallback(() => {
    setConversationOpen(false);
    setAvatarState('idle');
  }, []);

  const getPlacedItemForSlot = useCallback(
    (slotId: string) => {
      return roomConfig.placedItems.find((item) => item.slotId === slotId);
    },
    [roomConfig.placedItems]
  );

  const placeItem = useCallback(
    async (slotId: string, item: ItemToPlace): Promise<boolean> => {
      try {
        // Client-side validation first
        if (!canPlaceInSlot(slotId, item)) {
          console.warn(`Item type ${item.category} cannot be placed in slot ${slotId}`);
          return false;
        }
        
        const res = await fetch('/api/room/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: item.id,
            slotId: slotId
          })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          // Update local state optimistically
          setRoomConfig((prev) => ({
            ...prev,
            placedItems: [
              ...prev.placedItems.filter((i) => i.slotId !== slotId && i.itemId !== item.id),
              { 
                itemId: item.id,
                slotId,
                itemType: item.category,
                imageUrl: item.imageUrl,
                name: item.name,
                category: item.category
              },
            ],
          }));
          
          // Clear placement state
          setItemToPlace(null);
          setSelectedSlot(null);
          setPlacementMode(false);
          
          return true;
        } else {
          console.error('Failed to place item:', data.error);
          alert(data.error || 'Failed to place item');
          return false;
        }
      } catch (err) {
        console.error('Place item error:', err);
        return false;
      }
    },
    []
  );

  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/room/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Update local state
        setRoomConfig((prev) => ({
          ...prev,
          placedItems: prev.placedItems.filter((i) => i.itemId !== itemId),
        }));
        return true;
      } else {
        console.error('Failed to remove item:', data.error);
        return false;
      }
    } catch (err) {
      console.error('Remove item error:', err);
      return false;
    }
  }, []);

  const setWallpaper = useCallback(async (wallpaperId: string | null): Promise<boolean> => {
    try {
      const res = await fetch('/api/room/wallpaper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaperId })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setRoomConfig((prev) => ({
          ...prev,
          wallpaperId
        }));
        return true;
      } else {
        console.error('Failed to set wallpaper:', data.error);
        return false;
      }
    } catch (err) {
      console.error('Set wallpaper error:', err);
      return false;
    }
  }, []);

  const getAvailableSlots = useCallback((itemCategory?: string, placementType?: string): PlacementSlot[] => {
    const occupiedSlotIds = new Set(roomConfig.placedItems.map(i => i.slotId));
    
    return PLACEMENT_SLOTS.filter(slot => {
      // Filter out occupied slots
      if (occupiedSlotIds.has(slot.id)) return false;
      
      // If category is specified, check compatibility
      if (itemCategory) {
        // Use the robust validation function
        const itemInfo = { category: itemCategory, placement_type: placementType };
        if (!canPlaceInSlot(slot.id, itemInfo)) {
          return false;
        }
      }
      
      return true;
    });
  }, [roomConfig.placedItems]);

  // When entering placement mode with an item, auto-select compatible slots
  useEffect(() => {
    if (itemToPlace && isPlacementMode) {
      const compatibleSlots = getAvailableSlots(itemToPlace.category, itemToPlace.placementType);
      console.log(`Placement mode: ${compatibleSlots.length} compatible slots for ${itemToPlace.category}`);
    }
  }, [itemToPlace, isPlacementMode, getAvailableSlots]);

  const value: RoomContextValue = {
    roomConfig,
    setRoomConfig,
    isLoading,
    isPlacementMode,
    setPlacementMode,
    selectedSlot,
    setSelectedSlot,
    itemToPlace,
    setItemToPlace,
    avatarState,
    setAvatarState,
    isConversationOpen,
    openConversation,
    closeConversation,
    getPlacedItemForSlot,
    placeItem,
    removeItem,
    setWallpaper,
    refreshRoomConfig,
    getAvailableSlots,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}

export { PLACEMENT_SLOTS };
