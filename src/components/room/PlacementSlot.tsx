'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRoom } from '@/lib/room';
import { getSlotById, canPlaceInSlot } from '@/lib/room/PlacementSlotMap';
import { Loader2 } from 'lucide-react';

interface PlacementSlotProps {
  slotId: string;
  className?: string;
}

/**
 * Individual placement slot component
 * Shows visual feedback based on placement mode
 * Handles item placement when an item is selected
 */
export function PlacementSlot({ slotId, className }: PlacementSlotProps) {
  const { 
    isPlacementMode, 
    selectedSlot, 
    setSelectedSlot, 
    getPlacedItemForSlot,
    itemToPlace,
    placeItem,
    setPlacementMode,
    setItemToPlace
  } = useRoom();
  const [isHovered, setIsHovered] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const slot = getSlotById(slotId);
  const placedItem = getPlacedItemForSlot(slotId);
  const isSelected = selectedSlot?.id === slotId;

  if (!slot) return null;

  // Check if the current item can be placed in this slot
  const canPlaceItemHere = itemToPlace 
    ? canPlaceInSlot(slotId, itemToPlace)
    : false;

  const handleClick = async () => {
    if (!isPlacementMode) return;

    // If we have an item to place and slot is compatible and empty
    if (itemToPlace && canPlaceItemHere && !placedItem) {
      setIsPlacing(true);
      try {
        const success = await placeItem(slotId, itemToPlace);
        if (success) {
          // Successfully placed - exit placement mode
          setItemToPlace(null);
          setPlacementMode(false);
        }
      } catch (error) {
        console.error('Failed to place item:', error);
      } finally {
        setIsPlacing(false);
      }
    } else {
      // Just select/deselect the slot
      setSelectedSlot(isSelected ? null : slot);
    }
  };

  // Determine slot visual state
  const isCompatibleSlot = itemToPlace && canPlaceItemHere && !placedItem;
  const isIncompatibleSlot = itemToPlace && !canPlaceItemHere && !placedItem;

  return (
    <div
      className={cn(
        'relative w-full h-full rounded-md transition-all duration-200',
        // Default state - invisible
        !isPlacementMode && !placedItem && 'opacity-0',
        // Placement mode - show slots
        isPlacementMode && !placedItem && 'border-2 border-dashed',
        // Compatible slot styling
        isPlacementMode && isCompatibleSlot && 'border-green-400/70 bg-green-100/30 cursor-pointer',
        isPlacementMode && isCompatibleSlot && isHovered && 'border-green-500 bg-green-200/50 scale-105',
        // Incompatible slot styling
        isPlacementMode && isIncompatibleSlot && 'border-sage-300/30 bg-sage-100/10 cursor-not-allowed opacity-50',
        // No item selected - neutral styling
        isPlacementMode && !itemToPlace && !placedItem && 'border-sage-400/50 bg-sage-100/20',
        isPlacementMode && !itemToPlace && isHovered && !placedItem && 'border-sage-500 bg-sage-200/40 scale-105',
        isPlacementMode && isSelected && 'border-sage-600 bg-sage-300/50 ring-2 ring-sage-400/50',
        // Has item placed
        placedItem && 'cursor-pointer',
        // Placing state
        isPlacing && 'opacity-70 pointer-events-none',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Placed item */}
      {placedItem && (
        <div className="absolute inset-0 flex items-center justify-center">
          {placedItem.imageUrl ? (
            <img
              src={placedItem.imageUrl}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            // Placeholder for items without images
            <div className="w-3/4 h-3/4 bg-sage-300/40 rounded-lg flex items-center justify-center text-sage-500 text-xs">
              🌿
            </div>
          )}
        </div>
      )}

      {/* Slot label (only in placement mode when hovered) */}
      {isPlacementMode && !placedItem && isHovered && (
        <div className={cn(
          "absolute -top-6 left-1/2 -translate-x-1/2 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap",
          isCompatibleSlot ? "bg-green-700" : "bg-sage-800"
        )}>
          {isCompatibleSlot ? `Place ${itemToPlace?.name} here` : slot.label}
        </div>
      )}

      {/* Empty slot indicator in placement mode */}
      {isPlacementMode && !placedItem && !isPlacing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'w-6 h-6 rounded-full border-2 border-dashed transition-colors flex items-center justify-center',
            isCompatibleSlot && isHovered ? 'border-green-500 bg-green-100' : '',
            isCompatibleSlot && !isHovered ? 'border-green-400' : '',
            !isCompatibleSlot && isHovered ? 'border-sage-500' : '',
            !isCompatibleSlot && !isHovered ? 'border-sage-400/40' : ''
          )}>
            <span className={cn(
              'text-sm',
              isCompatibleSlot && isHovered ? 'text-green-600' : '',
              isCompatibleSlot && !isHovered ? 'text-green-500' : '',
              !isCompatibleSlot && isHovered ? 'text-sage-600' : '',
              !isCompatibleSlot && !isHovered ? 'text-sage-400' : ''
            )}>
              +
            </span>
          </div>
        </div>
      )}

      {/* Loading indicator while placing */}
      {isPlacing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
