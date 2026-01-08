'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Grid3X3, Check, MapPin, Trash2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InventoryItem, ItemCategory } from '@/types/database';

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItemForPlacement?: (item: InventoryItem) => void;
  isPlacementMode?: boolean;
}

type FilterTab = 'all' | 'available' | 'placed';

const CATEGORY_ICONS: Record<ItemCategory, string> = {
  plant: '🌿',
  furniture: '🪑',
  wallpaper: '🖼️',
  accessory: '✨',
};

export function InventoryPanel({ 
  isOpen, 
  onClose, 
  onSelectItemForPlacement,
  isPlacementMode = false 
}: InventoryPanelProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [counts, setCounts] = useState({ total: 0, available: 0, placed: 0 });

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/shop/inventory');
      
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setCounts(data.counts || { total: 0, available: 0, placed: 0 });
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to load inventory');
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
      setError('Network error loading inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen, fetchInventory]);

  const handleSelectItem = (item: InventoryItem) => {
    if (isPlacementMode && !item.is_placed) {
      onSelectItemForPlacement?.(item);
      onClose();
    } else {
      setSelectedItem(selectedItem?.id === item.id ? null : item);
    }
  };

  const handleRemoveFromRoom = async (item: InventoryItem) => {
    if (removing) return;
    
    setRemoving(item.id);
    
    try {
      const res = await fetch('/api/room/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Update local state
        setItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, is_placed: false, placed_slot_id: null } : i
        ));
        setCounts(prev => ({
          ...prev,
          available: prev.available + 1,
          placed: prev.placed - 1
        }));
        setSelectedItem(null);
      } else {
        alert(data.error || 'Failed to remove item from room');
      }
    } catch (err) {
      console.error('Remove item error:', err);
      alert('Error removing item. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  // Filter items based on active filters
  const filteredItems = items.filter(item => {
    // Filter by placement status
    if (activeFilter === 'available' && item.is_placed) return false;
    if (activeFilter === 'placed' && !item.is_placed) return false;
    
    // Filter by category
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    
    return true;
  });

  // Group items by category for display
  const groupedItems = filteredItems.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<ItemCategory, InventoryItem[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-sage-100 bg-sage-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sage-100 rounded-lg text-sage-600">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-sage-900">My Inventory</h2>
                  <p className="text-sm text-sage-500">
                    {counts.total} items • {counts.available} available
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-sage-100 rounded-full transition-colors text-sage-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {(['all', 'available', 'placed'] as FilterTab[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                    activeFilter === filter
                      ? "bg-sage-600 text-white"
                      : "bg-white text-sage-600 hover:bg-sage-100 border border-sage-200"
                  )}
                >
                  {filter}
                  {filter === 'all' && ` (${counts.total})`}
                  {filter === 'available' && ` (${counts.available})`}
                  {filter === 'placed' && ` (${counts.placed})`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="px-4 py-2 border-b border-sage-100 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                activeCategory === 'all'
                  ? "bg-sage-200 text-sage-800"
                  : "bg-sage-50 text-sage-500 hover:bg-sage-100"
              )}
            >
              All
            </button>
            {(Object.keys(CATEGORY_ICONS) as ItemCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize",
                  activeCategory === cat
                    ? "bg-sage-200 text-sage-800"
                    : "bg-sage-50 text-sage-500 hover:bg-sage-100"
                )}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-sage-50/30">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full mx-auto mb-4" />
                <p className="text-sage-400">Loading inventory...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-sage-300 mb-4" />
                <p className="text-sage-500">
                  {activeFilter === 'available' 
                    ? 'All your items are placed in your room!'
                    : activeFilter === 'placed'
                    ? 'No items placed yet. Visit the shop to get some!'
                    : 'Your inventory is empty. Visit the shop!'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {(Object.entries(groupedItems) as [ItemCategory, InventoryItem[]][]).map(([category, categoryItems]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-sage-600 mb-2 flex items-center gap-2 capitalize">
                      <span>{CATEGORY_ICONS[category]}</span>
                      {category}s ({categoryItems.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {categoryItems.map(item => (
                        <motion.button
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "relative aspect-square bg-white rounded-lg border p-2 transition-all",
                            selectedItem?.id === item.id
                              ? "border-sage-500 ring-2 ring-sage-300"
                              : item.is_placed
                              ? "border-green-200 bg-green-50/50"
                              : "border-sage-100 hover:border-sage-300",
                            isPlacementMode && !item.is_placed && "cursor-pointer hover:border-sage-500"
                          )}
                        >
                          {/* Item Image */}
                          {!failedImages.has(item.id) ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onError={() => setFailedImages(prev => new Set(prev).add(item.id))}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              {CATEGORY_ICONS[item.category]}
                            </div>
                          )}

                          {/* Placed indicator */}
                          {item.is_placed && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white p-0.5 rounded-full">
                              <MapPin size={10} />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Item Details */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="border-t border-sage-200 bg-white p-4"
              >
                <div className="flex gap-4">
                  {/* Item preview */}
                  <div className="w-20 h-20 bg-sage-50 rounded-lg flex items-center justify-center shrink-0">
                    {!failedImages.has(selectedItem.id) ? (
                      <img
                        src={selectedItem.image_url}
                        alt={selectedItem.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-3xl">{CATEGORY_ICONS[selectedItem.category]}</span>
                    )}
                  </div>
                  
                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sage-800">{selectedItem.name}</h4>
                    <p className="text-xs text-sage-500 line-clamp-2">{selectedItem.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                        selectedItem.is_placed 
                          ? "bg-green-100 text-green-700"
                          : "bg-sage-100 text-sage-600"
                      )}>
                        {selectedItem.is_placed ? 'Placed' : 'Available'}
                      </span>
                      {selectedItem.placed_slot_id && (
                        <span className="text-xs text-sage-400">
                          @ {selectedItem.placed_slot_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {selectedItem.is_placed ? (
                    <button
                      onClick={() => handleRemoveFromRoom(selectedItem)}
                      disabled={removing === selectedItem.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      {removing === selectedItem.id ? (
                        <span className="animate-pulse">Removing...</span>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Remove from Room
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectItemForPlacement?.(selectedItem);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors"
                    >
                      <Grid3X3 size={16} />
                      Place in Room
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 bg-sage-100 text-sage-600 rounded-lg font-medium hover:bg-sage-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Placement Mode Hint */}
          {isPlacementMode && !selectedItem && (
            <div className="p-4 bg-sage-100 border-t border-sage-200">
              <p className="text-sm text-sage-600 text-center">
                <span className="font-medium">Placement Mode:</span> Select an available item to place in your room
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
