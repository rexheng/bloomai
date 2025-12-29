import { createClient } from '@/lib/supabase/server';
import { ShopClient } from '@/components/shop/ShopClient';
import { ShoppingBag } from 'lucide-react';

export default async function ShopPage() {
  const supabase = await createClient();

  // Fetch items directly from DB (bypassing API route to save a fetch)
  // or use the API route URL if needed, but direct DB is better in Server Component.
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('point_cost', { ascending: true });

  if (error) {
    console.error("Error fetching items in ShopPage:", error);
    // Don't crash the page, just show empty or error
  }

  return (
    <div className="min-h-screen bg-sage-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sage-100 rounded-xl text-sage-600">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-sage-900">Garden Shop</h1>
            <p className="text-sage-500">Collect plants and furniture for your sanctuary</p>
          </div>
        </div>

        <ShopClient initialItems={items || []} />
      </div>
    </div>
  );
}
