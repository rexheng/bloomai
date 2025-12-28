
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  // RLS allows 'authenticated' to read items. 
  // If public access is needed, we might need a different policy or admin client here.
  // Assuming user is authenticated.

  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('point_cost', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(items);
}
