'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, Lock, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShopItemWithOwnership } from '@/types/database';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPoints?: number;
  onPurchaseComplete?: () => void;
}

type CategoryFilter = 'all' | 'plant' | 'furniture' | 'wallpaper' | 'accessory';

export function ShopModal({ isOpen, onClose, userPoints = 0, onPurchaseComplete }: ShopModalProps) {
  const [items, setItems] = useState<ShopItemWithOwnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  // Filters
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');

  // Fetch Items when modal opens
  useEffect(() => {
    if (isOpen) {
        fetchItems();
    }
  }, [isOpen]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch('/api/shop/items');
        if (!res.ok) throw new Error('Failed to load shop items');
        const data = await res.json();
        setItems(data);
    } catch (err: any) {
        console.error("Failed to load shop", err);
        setError(err.message || "Network error loading shop");
    } finally {
        setLoading(false);
    }
  };

  const handleBuy = async (item: ShopItemWithOwnership) => {
      if (buying) return;
      if (item.is_owned) return;
      if (userPoints < item.point_cost) {
          alert(`You need ${item.point_cost - userPoints} more points!`);
          return;
      }

      setBuying(item.id);
      try {
          const res = await fetch('/api/shop/buy', {
              method: 'POST',
              body: JSON.stringify({ itemId: item.id, expectedCost: item.point_cost })
          });
          const data = await res.json();
          
          if (res.ok && data.success) {
              // Optimistic update
              setItems(prev => prev.map(i => 
                  i.id === item.id ? { ...i, is_owned: true } : i
              ));
              // Trigger global point refresh if possible (window reload is crude but effective for MVP)
              // Ideally use a context or callback
              if (onPurchaseComplete) {
                  onPurchaseComplete();
              } else {
                  setTimeout(() => {
                      window.location.reload(); 
                  }, 500);
              }
          } else {
              alert(data.error || 'Failed to buy');
          }
      } catch (e) {
          alert('Error purchasing item');
      } finally {
          setBuying(null);
      }
  };

  // Filter items
  const filteredItems = items.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
  });

  const categories: { id: CategoryFilter; label: string; icon: string }[] = [
      { id: 'all', label: 'All Items', icon: '🛍️' },
      { id: 'plant', label: 'Plants', icon: '🌿' },
      { id: 'furniture', label: 'Furniture', icon: '🪑' },
      { id: 'wallpaper', label: 'Wallpapers', icon: '🎨' },
      { id: 'accessory', label: 'Accessories', icon: '✨' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/20 backdrop-blur-sm">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 20 }}
             className="bg-white md:rounded-2xl shadow-2xl w-full max-w-5xl h-full md:h-[85vh] flex flex-col overflow-hidden border border-white/20"
           >
              {/* Header */}
              <div className="p-6 border-b border-sage-100 flex flex-col gap-4 bg-gradient-to-r from-sage-50 to-white">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-3 bg-sage-100 rounded-xl text-sage-600 shadow-sm">
                              <ShoppingBag size={24} />
                          </div>
                          <div>
                              <h2 className="text-xl font-bold text-sage-900">Garden Shop</h2>
                              <p className="text-sm text-sage-500">Spend your Bloom Points to decorate</p>
                          </div>
                      </div>
                      <button onClick={onClose} className="p-2 hover:bg-sage-100 rounded-full transition-colors text-sage-400 hover:text-sage-600">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                      {/* Tabs */}
                      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                          {categories.map(cat => (
                              <button
                                  key={cat.id}
                                  onClick={() => setCategory(cat.id)}
                                  className={cn(
                                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                      category === cat.id 
                                          ? "bg-sage-600 text-white shadow-md shadow-sage-200" 
                                          : "bg-sage-50 text-sage-600 hover:bg-sage-100"
                                  )}
                              >
                                  <span>{cat.icon}</span>
                                  {cat.label}
                              </button>
                          ))}
                      </div>
                      
                      {/* Search */}
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" size={16} />
                          <input 
                              type="text" 
                              placeholder="Search items..." 
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="pl-9 pr-4 py-2 rounded-full border border-sage-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 w-full md:w-64"
                          />
                      </div>
                  </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-sage-50/30">
                  {loading ? (
                       <div className="h-full flex flex-col items-center justify-center text-sage-400 gap-3">
                           <div className="w-8 h-8 border-2 border-sage-200 border-t-sage-500 rounded-full animate-spin" />
                           <p>Loading catalogue...</p>
                       </div>
                  ) : error ? (
                       <div className="h-full flex items-center justify-center text-red-400">{error}</div>
                  ) : filteredItems.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-sage-400 gap-2">
                           <Search size={48} className="opacity-20" />
                           <p>No items found</p>
                       </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems.map((item) => {
                            const canAfford = userPoints >= item.point_cost;
                            const isOwned = item.is_owned;
                            
                            return (
                                <div 
                                    key={item.id} 
                                    className={cn(
                                        "group bg-white p-3 rounded-2xl border transition-all duration-300 flex flex-col gap-3",
                                        isOwned ? "border-sage-100 opacity-90" : "border-sage-200 hover:border-sage-300 hover:shadow-lg hover:-translate-y-1"
                                    )}
                                >
                                    {/* Image Area */}
                                    <div className="aspect-square bg-gradient-to-br from-sage-50 to-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                                        {!failedImages.has(item.id) ? (
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name}
                                                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                                                onError={() => setFailedImages(prev => new Set(prev).add(item.id))}
                                            />
                                        ) : (
                                            <div className="text-5xl opacity-50">
                                                 {item.category === 'plant' ? '🌿' : item.category === 'furniture' ? '🪑' : '✨'}
                                            </div>
                                        )}
                                        
                                        {/* Badges */}
                                        {isOwned && (
                                            <div className="absolute top-2 right-2 bg-green-500/90 text-white p-1.5 rounded-full shadow-lg backdrop-blur-sm">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                        {item.is_premium_only && !isOwned && (
                                            <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                                                Premium
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-sage-800 text-sm leading-tight">{item.name}</h3>
                                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded ml-2 font-medium capitalize flex-shrink-0", 
                                                item.rarity === 'common' ? 'bg-slate-100 text-slate-500' :
                                                item.rarity === 'uncommon' ? 'bg-green-100 text-green-700' :
                                                item.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            )}>{item.rarity}</span>
                                        </div>
                                        {/* <p className="text-xs text-sage-400 line-clamp-2 min-h-[2.5em]">{item.description}</p> */}
                                    </div>

                                    {/* Action */}
                                    <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-dashed border-sage-100">
                                        <div className={cn("font-bold flex items-center gap-1", 
                                            !canAfford && !isOwned ? "text-red-400" : "text-sage-700"
                                        )}>
                                            <span className="text-yellow-500 text-sm">✨</span>
                                            {item.point_cost}
                                        </div>
                                        <button 
                                            onClick={() => handleBuy(item)}
                                            disabled={isOwned || buying === item.id || (!canAfford && !isOwned)}
                                            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all w-24 flex items-center justify-center",
                                                isOwned 
                                                    ? "bg-sage-50 text-sage-400 cursor-default" 
                                                    : !canAfford
                                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                        : "bg-sage-600 text-white hover:bg-sage-700 hover:shadow-md active:scale-95 shadow-sm"
                                            )}
                                        >
                                            {buying === item.id ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : isOwned ? (
                                                'Owned'
                                            ) : !canAfford ? (
                                                'Need XP'
                                            ) : (
                                                'Buy'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                  )}
              </div>
           </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
