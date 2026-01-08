/**
 * Placement slot definitions for the virtual room
 * Defines fixed positions where items can be placed
 */

export type SlotCategory = 'wall' | 'surface' | 'floor' | 'window' | 'avatar-adjacent';

export interface PlacementSlot {
  id: string;
  category: SlotCategory;
  /** Position as percentage of room dimensions */
  position: { x: number; y: number };
  /** Size as percentage of room dimensions */
  size: { width: number; height: number };
  /** Item categories that can be placed here */
  acceptedItemTypes: string[];
  /** Display name for UI */
  label: string;
}

/**
 * All placement slots in the room
 * Positions are percentages (0-100) from top-left
 */
export const PLACEMENT_SLOTS: PlacementSlot[] = [
  // Wall slots (top of room)
  {
    id: 'WALL-L1',
    category: 'wall',
    position: { x: 10, y: 8 },
    size: { width: 12, height: 18 },
    acceptedItemTypes: ['wallpaper', 'poster', 'frame', 'clock', 'accessory'], // Added accessory
    label: 'Left Wall 1',
  },
  {
    id: 'WALL-L2',
    category: 'wall',
    position: { x: 25, y: 5 },
    size: { width: 12, height: 18 },
    acceptedItemTypes: ['wallpaper', 'poster', 'frame', 'accessory'],
    label: 'Left Wall 2',
  },
  {
    id: 'WALL-C1',
    category: 'wall',
    position: { x: 44, y: 3 },
    size: { width: 12, height: 15 },
    acceptedItemTypes: ['clock', 'frame', 'poster', 'accessory'],
    label: 'Center Wall',
  },
  {
    id: 'WALL-R1',
    category: 'wall',
    position: { x: 63, y: 5 },
    size: { width: 12, height: 18 },
    acceptedItemTypes: ['wallpaper', 'poster', 'frame', 'accessory'],
    label: 'Right Wall 1',
  },
  {
    id: 'WALL-R2',
    category: 'wall',
    position: { x: 80, y: 8 },
    size: { width: 12, height: 18 },
    acceptedItemTypes: ['wallpaper', 'poster', 'frame', 'accessory'],
    label: 'Right Wall 2',
  },

  // Shelf slots (left side)
  {
    id: 'SHELF-T',
    category: 'surface',
    position: { x: 8, y: 28 },
    size: { width: 18, height: 10 },
    acceptedItemTypes: ['plant', 'accessory', 'book'],
    label: 'Top Shelf',
  },
  {
    id: 'SHELF-M',
    category: 'surface',
    position: { x: 8, y: 42 },
    size: { width: 18, height: 10 },
    acceptedItemTypes: ['plant', 'accessory', 'candle'],
    label: 'Middle Shelf',
  },
  {
    id: 'SHELF-B',
    category: 'surface',
    position: { x: 8, y: 56 },
    size: { width: 18, height: 10 },
    acceptedItemTypes: ['plant', 'radio', 'accessory'],
    label: 'Bottom Shelf',
  },

  // Desk surface (right side)
  {
    id: 'DESK-L',
    category: 'surface',
    position: { x: 58, y: 35 },
    size: { width: 12, height: 12 },
    acceptedItemTypes: ['plant', 'lamp', 'accessory'],
    label: 'Desk Left',
  },
  {
    id: 'DESK-C',
    category: 'surface',
    position: { x: 72, y: 35 },
    size: { width: 12, height: 12 },
    acceptedItemTypes: ['book', 'accessory', 'stationery'],
    label: 'Desk Center',
  },
  {
    id: 'DESK-R',
    category: 'surface',
    position: { x: 86, y: 35 },
    size: { width: 10, height: 12 },
    acceptedItemTypes: ['lamp', 'accessory'],
    label: 'Desk Right',
  },

  // Window slot (center, behind avatar)
  {
    id: 'WINDOW',
    category: 'window',
    position: { x: 35, y: 18 },
    size: { width: 20, height: 28 },
    acceptedItemTypes: ['plant', 'hanging', 'accessory'],
    label: 'Windowsill',
  },

  // Avatar-adjacent slot
  {
    id: 'AVATAR-SIDE',
    category: 'avatar-adjacent',
    position: { x: 52, y: 50 },
    size: { width: 10, height: 12 },
    acceptedItemTypes: ['accessory', 'companion'],
    label: 'Beside Bloom',
  },

  // Floor slots
  {
    id: 'FLOOR-L',
    category: 'floor',
    position: { x: 5, y: 75 },
    size: { width: 15, height: 18 },
    acceptedItemTypes: ['plant', 'furniture', 'rug'],
    label: 'Floor Left',
  },
  {
    id: 'FLOOR-C',
    category: 'floor',
    position: { x: 40, y: 78 },
    size: { width: 20, height: 15 },
    acceptedItemTypes: ['rug', 'cushion', 'pet', 'furniture', 'accessory'],
    label: 'Floor Center',
  },
  {
    id: 'FLOOR-R',
    category: 'floor',
    position: { x: 75, y: 75 },
    size: { width: 15, height: 18 },
    acceptedItemTypes: ['plant', 'furniture', 'toy', 'accessory'],
    label: 'Floor Right',
  },
];

/**
 * Get slots by category
 */
export function getSlotsByCategory(category: SlotCategory): PlacementSlot[] {
  return PLACEMENT_SLOTS.filter((slot) => slot.category === category);
}

/**
 * Get a specific slot by ID
 */
export function getSlotById(id: string): PlacementSlot | undefined {
  return PLACEMENT_SLOTS.find((slot) => slot.id === id);
}

/**
 * Check if an item can be placed in a slot
 * Validates using both item category and placement_type if available
 */
export function canPlaceInSlot(slotId: string, itemOrCategory: string | { category: string; placement_type?: string }): boolean {
  const slot = getSlotById(slotId);
  if (!slot) return false;

  // Extract category and placement_type
  let category: string;
  let placementType: string | undefined;

  if (typeof itemOrCategory === 'string') {
    category = itemOrCategory;
  } else {
    category = itemOrCategory.category;
    placementType = itemOrCategory.placement_type;
  }

  // If placement_type is available, use strict validation similar to DB
  if (placementType) {
     if (slot.category === 'wall' && (placementType === 'wall' || category === 'wallpaper')) return true;
     if (slot.category === 'floor' && (placementType === 'floor' || category === 'furniture')) return true;
     if (slot.category === 'surface' && (placementType === 'surface' || category === 'plant' || category === 'accessory')) return true;
     if (slot.category === 'window' && (placementType === 'window' || category === 'plant')) return true;
     if (slot.category === 'avatar-adjacent') return true; // Flexible slot
  }

  // Fallback to simpler category check
  return slot.acceptedItemTypes.includes(category);
}

/**
 * Mapping of slot category to compatible placement_type values
 * Used to determine which items can be placed in which slots
 */
export const SLOT_PLACEMENT_COMPATIBILITY: Record<SlotCategory, string[]> = {
  'wall': ['wall'],
  'surface': ['surface', 'floor'], // Surface slots can accept some floor items (small plants)
  'floor': ['floor'],
  'window': ['surface', 'floor'], // Window slots work like surfaces
  'avatar-adjacent': ['floor', 'surface'], // Can have small items near the avatar
};

/**
 * Get available slots for a given placement type
 */
export function getCompatibleSlots(placementType: string): PlacementSlot[] {
  return PLACEMENT_SLOTS.filter(slot => 
    SLOT_PLACEMENT_COMPATIBILITY[slot.category]?.includes(placementType)
  );
}
