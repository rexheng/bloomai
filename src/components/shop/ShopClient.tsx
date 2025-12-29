'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Item {
  id: string;
  name: string;
  description: string;
  point_cost: number;
  category: string;
  image_url: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface ShopClientProps {
  initialItems: Item[];
}

export function ShopClient({ initialItems }: ShopClientProps) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [userItems, setUserItems] = useState<Set<string>>(new Set());
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Fetch User Inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const invRes = await fetch('/api/shop/inventory');
        if (invRes.ok) {
          const params = await invRes.json();
          setUserItems(new Set(params));
        } else {
            console.error("Failed to fetch inventory");
        }
      } catch (err) {
        console.error("Failed to load inventory", err);
      } finally {
        setLoadingInventory(false);
      }
    };
    fetchInventory();
  }, []);

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
              window.location.reload(); // Brute force refresh for MVP
          } else {
              alert(data.error || 'Failed to buy');
          }
      } catch (e) {
          alert('Error purchasing item');
      } finally {
          setBuying(null);
      }
  };

  if (items.length === 0) {
      return <div className="text-center py-12 text-sage-400">No items available in the shop.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        {isOwned && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                <Check size={16} />
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
                            disabled={isOwned || buying === item.id || loadingInventory}
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
  );
}
