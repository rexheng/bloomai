
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ITEMS = [
  // Plants
  {
    name: 'Monstera',
    description: 'A classic favorite. Adds a tropical touch to any corner.',
    category: 'plant',
    point_cost: 50,
    image_url: '/items/monstera.png',
    rarity: 'common'
  },
  {
    name: 'Succulent',
    description: 'Tiny but resilient. Perfect for your desk.',
    category: 'plant',
    point_cost: 50,
    image_url: '/items/succulent.png',
    rarity: 'common'
  },
  {
    name: 'Boston Fern',
    description: 'Lush and leafy. Needs a bit of love.',
    category: 'plant',
    point_cost: 100,
    image_url: '/items/fern.png',
    rarity: 'uncommon'
  },
  {
    name: 'Sunflower',
    description: 'Bright and cheerful. Brings sunshine indoors.',
    category: 'plant',
    point_cost: 150,
    image_url: '/items/sunflower.png',
    rarity: 'uncommon'
  },
  // Furniture
  {
    name: 'Cozy Lamp',
    description: 'Warm lighting for late night journaling.',
    category: 'furniture',
    point_cost: 75,
    image_url: '/items/lamp.png',
    rarity: 'common'
  },
  {
    name: 'Reading Chair',
    description: 'The perfect spot to curl up with a book.',
    category: 'furniture',
    point_cost: 200,
    image_url: '/items/chair.png',
    rarity: 'rare'
  },
  {
    name: 'Persian Rug',
    description: 'Ties the room together.',
    category: 'furniture',
    point_cost: 150,
    image_url: '/items/rug.png',
    rarity: 'uncommon'
  },
  {
    name: 'Oak Bookshelf',
    description: 'Space for all your knowledge.',
    category: 'furniture',
    point_cost: 200,
    image_url: '/items/bookshelf.png',
    rarity: 'rare'
  }
];

async function seed() {
  console.log('Seeding items...');

  // Optional: Clear existing items?
  // await supabase.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const item of ITEMS) {
    // Check if item exists
    const { data: existing } = await supabase
        .from('items')
        .select('id')
        .eq('name', item.name)
        .single();

    if (existing) {
        console.log(`Item ${item.name} already exists. Skipping.`);
        continue;
    }

    const { data, error } = await supabase
      .from('items')
      .insert(item)
      .select();

    if (error) {
      console.error(`Error seeding ${item.name}:`, error.message);
    } else {
      console.log(`Seeded ${item.name}`);
    }
  }

  console.log('Seeding complete!');
}

seed();
