'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PointsDisplay } from '@/components/gamification/PointsDisplay';

interface Item {
  id: string;
  name: string;
  description: string;
  point_cost: number;
  category: string;
  image_url: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShopModal({ isOpen, onClose }: ShopModalProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [userItems, setUserItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Fetch Items & User Inventory
  useEffect(() => {
    if (isOpen) {
        setLoading(true);
        setError(null);
        const fetchData = async () => {
            try {
                // 1. Fetch Items
                const res = await fetch('/api/shop/items');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setItems(data);
                    } else {
                        console.error("Shop data is not an array:", data);
                        setError("Invalid data format from server");
                    }
                } else {
                    const err = await res.json();
                    console.error("Shop fetch error:", err);
                    setError(err.error || "Failed to load items");
                }

                // 2. Fetch User Inventory
                const invRes = await fetch('/api/shop/inventory');
                if (invRes.ok) {
                    const params = await invRes.json();
                    setUserItems(new Set(params));
                }
                
            } catch (err) {
                console.error("Failed to load shop", err);
                setError("Network error loading shop");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }
  }, [isOpen]);

  const handleBuy = async (item: Item) => {
      if (buying) return;
      setBuying(item.id);
      try {
          const res = await fetch('/api/shop/buy', {
              method: 'POST',
              body: JSON.stringify({ itemId: item.id })
          });
          const data = await res.json();
          if (res.ok) {
              // Success feedback
              alert(`Bought ${item.name}!`);
              setUserItems(prev => new Set(prev).add(item.id));
              // Trigger point refresh? 
              // Ideally simple global state or callback.
              window.location.reload(); // Brute force refresh for MVP to update points header
          } else {
              alert(data.error || 'Failed to buy');
          }
      } catch (e) {
          alert('Error purchasing item');
      } finally {
          setBuying(null);
      }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/20 backdrop-blur-sm">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="bg-white md:rounded-2xl shadow-xl w-full max-w-4xl h-full md:h-[80vh] flex flex-col overflow-hidden"
           >
              {/* Header */}
              <div className="p-6 border-b border-sage-100 flex items-center justify-between bg-sage-50/50">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-sage-100 rounded-lg text-sage-600">
                          <ShoppingBag size={24} />
                      </div>
                      <div>
                          <h2 className="text-xl font-bold text-sage-900">Garden Shop</h2>
                          <p className="text-sm text-sage-500">Decorate your sanctuary</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      {/* We show points inside modal too? */}
                      <button onClick={onClose} className="p-2 hover:bg-sage-100 rounded-full transition-colors text-sage-500">
                          <X size={20} />
                      </button>
                  </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-sage-50/30">
                  {loading ? (
                       <div className="text-center py-12 text-sage-400">Loading shop items...</div>
                  ) : error ? (
                       <div className="text-center py-12 text-red-400">{error}</div>
                  ) : items.length === 0 ? (
                       <div className="text-center py-12 text-sage-400">No items available in the shop.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => {
                            const isOwned = userItems.has(item.id);
                            return (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-sage-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                                    <div className="aspect-square bg-sage-50 rounded-lg flex items-center justify-center relative overflow-hidden group">
                                        {!failedImages.has(item.id) ? (
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name}
                                                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                                                onError={() => setFailedImages(prev => new Set(prev).add(item.id))}
                                            />
                                        ) : (
                                            <div className="text-4xl">
                                                 {item.category === 'plant' ? '🌿' : '🪑'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-sage-800">{item.name}</h3>
                                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", 
                                                item.rarity === 'common' ? 'bg-slate-100 text-slate-600' :
                                                item.rarity === 'uncommon' ? 'bg-green-100 text-green-700' :
                                                'bg-amber-100 text-amber-700'
                                            )}>{item.rarity}</span>
                                        </div>
                                        <p className="text-xs text-sage-500 mt-1 line-clamp-2">{item.description}</p>
                                    </div>
                                    <div className="mt-auto pt-2 flex items-center justify-between">
                                        <div className="font-bold text-sage-900 flex items-center gap-1">
                                            <span className="text-yellow-500 text-sm">✨</span>
                                            {item.point_cost}
                                        </div>
                                        <button 
                                            onClick={() => handleBuy(item)}
                                            disabled={isOwned || buying === item.id}
                                            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                                isOwned ? "bg-sage-100 text-sage-400 cursor-not-allowed" :
                                                "bg-sage-600 text-white hover:bg-sage-700 active:scale-95"
                                            )}
                                        >
                                            {buying === item.id ? '...' : isOwned ? 'Owned' : 'Buy'}
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
