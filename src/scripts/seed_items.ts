
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

// Item type definition with all required fields
interface ShopItem {
  sprite_id: string;  // Unique identifier for deduplication
  name: string;
  description: string;
  category: 'plant' | 'furniture' | 'wallpaper' | 'accessory';
  placement_type: 'surface' | 'floor' | 'wall' | 'window';
  size: 'small' | 'medium' | 'large';
  point_cost: number;
  image_url: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  is_premium_only: boolean;
  sort_order: number;
  is_active: boolean;
}

const ITEMS: ShopItem[] = [
  // ============================================
  // PLANTS - Surface placement
  // ============================================
  {
    sprite_id: 'plant_tropical_monstera',
    name: 'Monstera',
    description: 'A classic favorite. Adds a tropical touch to any corner.',
    category: 'plant',
    placement_type: 'surface',
    size: 'medium',
    point_cost: 50,
    image_url: '/items/monstera.png',
    rarity: 'common',
    is_premium_only: false,
    sort_order: 10,
    is_active: true
  },
  {
    sprite_id: 'plant_succulent_baby',
    name: 'Succulent',
    description: 'Tiny but resilient. Perfect for your desk.',
    category: 'plant',
    placement_type: 'surface',
    size: 'small',
    point_cost: 50,
    image_url: '/items/succulent.png',
    rarity: 'common',
    is_premium_only: false,
    sort_order: 11,
    is_active: true
  },
  {
    sprite_id: 'plant_fern_boston',
    name: 'Boston Fern',
    description: 'Lush and leafy. Needs a bit of love.',
    category: 'plant',
    placement_type: 'surface',
    size: 'medium',
    point_cost: 100,
    image_url: '/items/fern.png',
    rarity: 'uncommon',
    is_premium_only: false,
    sort_order: 12,
    is_active: true
  },
  {
    sprite_id: 'plant_flower_sunflower',
    name: 'Sunflower',
    description: 'Bright and cheerful. Brings sunshine indoors.',
    category: 'plant',
    placement_type: 'surface',
    size: 'medium',
    point_cost: 150,
    image_url: '/items/sunflower.png',
    rarity: 'uncommon',
    is_premium_only: false,
    sort_order: 13,
    is_active: true
  },
  {
    sprite_id: 'plant_cactus_prickly',
    name: 'Prickly Cactus',
    description: 'Low maintenance desert friend.',
    category: 'plant',
    placement_type: 'surface',
    size: 'small',
    point_cost: 75,
    image_url: '/items/cactus.png',
    rarity: 'common',
    is_premium_only: false,
    sort_order: 14,
    is_active: true
  },
  {
    sprite_id: 'plant_pothos_hanging',
    name: 'Golden Pothos',
    description: 'Cascading vines that purify the air.',
    category: 'plant',
    placement_type: 'window',
    size: 'medium',
    point_cost: 120,
    image_url: '/items/pothos.png',
    rarity: 'uncommon',
    is_premium_only: false,
    sort_order: 15,
    is_active: true
  },
  {
    sprite_id: 'plant_bonsai_ancient',
    name: 'Ancient Bonsai',
    description: 'A miniature tree with centuries of wisdom.',
    category: 'plant',
    placement_type: 'surface',
    size: 'medium',
    point_cost: 300,
    image_url: '/items/bonsai.png',
    rarity: 'rare',
    is_premium_only: false,
    sort_order: 16,
    is_active: true
  },
  {
    sprite_id: 'plant_orchid_purple',
    name: 'Purple Orchid',
    description: 'Elegant and exotic bloom.',
    category: 'plant',
    placement_type: 'surface',
    size: 'small',
    point_cost: 200,
    image_url: '/items/orchid.png',
    rarity: 'rare',
    is_premium_only: false,
    sort_order: 17,
    is_active: true
  },

  // ============================================
  // FURNITURE - Floor placement
  // ============================================
  {
    sprite_id: 'furniture_lamp_cozy',
    name: 'Cozy Lamp',
    description: 'Warm lighting for late night journaling.',
    category: 'furniture',
    placement_type: 'floor',
    size: 'small',
    point_cost: 75,
    image_url: '/items/lamp.png',
    rarity: 'common',
    is_premium_only: false,
    sort_order: 20,
    is_active: true
  },
  {
    sprite_id: 'furniture_chair_reading',
    name: 'Reading Chair',
    description: 'The perfect spot to curl up with a book.',
    category: 'furniture',
    placement_type: 'floor',
    size: 'large',
    point_cost: 200,
    image_url: '/items/chair.png',
    rarity: 'rare',
    is_premium_only: false,
    sort_order: 21,
    is_active: true
  },
  {
    sprite_id: 'furniture_rug_persian',
    name: 'Persian Rug',
    description: 'Ties the room together.',
    category: 'furniture',
    placement_type: 'floor',
    size: 'large',
    point_cost: 150,
    image_url: '/items/rug.png',
    rarity: 'uncommon',
    is_premium_only: false,
    sort_order: 22,
    is_active: true
  },
  {
    sprite_id: 'furniture_bookshelf_oak',
    name: 'Oak Bookshelf',
    description: 'Space for all your knowledge.',
    category: 'furniture',
    placement_type: 'floor',
    size: 'large',
    point_cost: 200,
    image_url: '/items/bookshelf.png',
    rarity: 'rare',
    is_premium_only: false,
    sort_order: 23,
    is_active: true
  },
  {
    sprite_id: 'furniture_table_coffee',
    name: 'Coffee Table',
    description: 'A cozy spot for your morning tea.',
    category: 'furniture',
    placement_type: 'floor',
    size: 'medium',
    point_cost: 125,
    image_url: '/items/coffee_table.png',
    rarity: 'uncommon',
    is_premium_only: false,
    sort_order: 24,
    is_active: true
  },

  // ============================================
  // ACCESSORIES - Surface placement
  // ============================================
  {
    sprite_id: 'accessory_candle_lavender',
    name: 'Lavender Candle',
    description: 'Calming scent for meditation.',
    category: 'accessory',
    placement_type: 'surface',
    size: 'small',
    point_cost: 40,
    image_url: '/items/candle.png',
    rarity: 'common',
    is_premium_only: false,
    sort_order: 30,
    is_active: true
  },
  {
    sprite_id: 'accessory_crystals_amethyst',
    name: 'Amethyst Crystals',
    description: 'Healing energy for your space.',
    category: 'accessory',
    placement_type: 'surface',
    size: 'small',
    point_cost: 80,
    image_url: '/items/crystals.png',
    rarity: 'uncommon',
    is_premium_only: false,
    sort_order: 31,
    is_active: true
  },
  {
    sprite_id: 'accessory_journal_leather',
    name: 'Leather Journal',
    description: 'Beautiful journal for your thoughts.',
    category: 'accessory',
    placement_type: 'surface',
    size: 'small',
    point_cost: 60,
    image_url: '/items/journal.png',
    rarity: 'common',
    is_premium_only: false,
    sort_order: 32,
    is_active: true
  },
  {
    sprite_id: 'accessory_mug_ceramic',
    name: 'Ceramic Mug',
    description: 'For your favorite warm beverage.',
    category: 'accessory',
    placement_type: 'surface',
    size: 'small',
    point_cost: 35,
    image_url: '/items/mug.png',
    rarity: 'common',
    is_premium_only: false,
    sort_order: 33,
    is_active: true
  },
  {
    sprite_id: 'accessory_clock_vintage',
    name: 'Vintage Clock',
    description: 'Keep track of mindful moments.',
    category: 'accessory',
    placement_type: 'wall',
    size: 'medium',
    point_cost: 100,
    image_url: '/items/clock.png',
    rarity: 'uncommon',
    is_premium_only: false,
    sort_order: 34,
    is_active: true
  },

  // ============================================
  // WALLPAPERS - Wall placement
  // ============================================
  {
    sprite_id: 'wallpaper_nature_forest',
    name: 'Forest Scene',
    description: 'Peaceful forest backdrop.',
    category: 'wallpaper',
    placement_type: 'wall',
    size: 'large',
    point_cost: 250,
    image_url: '/items/wallpaper_forest.png',
    rarity: 'rare',
    is_premium_only: false,
    sort_order: 40,
    is_active: true
  },
  {
    sprite_id: 'wallpaper_sky_sunset',
    name: 'Sunset Sky',
    description: 'Golden hour every hour.',
    category: 'wallpaper',
    placement_type: 'wall',
    size: 'large',
    point_cost: 200,
    image_url: '/items/wallpaper_sunset.png',
    rarity: 'uncommon',
    is_premium_only: false,
    sort_order: 41,
    is_active: true
  },
  {
    sprite_id: 'wallpaper_ocean_waves',
    name: 'Ocean Waves',
    description: 'Calming ocean view.',
    category: 'wallpaper',
    placement_type: 'wall',
    size: 'large',
    point_cost: 200,
    image_url: '/items/wallpaper_ocean.png',
    rarity: 'uncommon',
    is_premium_only: false,
    sort_order: 42,
    is_active: true
  },
  {
    sprite_id: 'wallpaper_stars_galaxy',
    name: 'Galaxy Stars',
    description: 'A window to the cosmos.',
    category: 'wallpaper',
    placement_type: 'wall',
    size: 'large',
    point_cost: 350,
    image_url: '/items/wallpaper_galaxy.png',
    rarity: 'legendary',
    is_premium_only: true,
    sort_order: 43,
    is_active: true
  },
];

async function seed() {
  console.log('🌱 Seeding shop items...');
  console.log(`Found ${ITEMS.length} items to seed.`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const item of ITEMS) {
    try {
      // Use upsert with sprite_id as the conflict key for deduplication
      const { data, error } = await supabase
        .from('items')
        .upsert(item, { 
          onConflict: 'sprite_id',
          ignoreDuplicates: false  // Update existing records
        })
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error seeding ${item.name} (${item.sprite_id}):`, error.message);
        errors++;
      } else {
        // Check if this was an insert or update by comparing dates
        const isNew = new Date(data.created_at).getTime() === new Date(data.created_at).getTime();
        console.log(`✅ ${item.name} (${item.sprite_id})`);
        created++;
      }
    } catch (err: any) {
      console.error(`❌ Unexpected error seeding ${item.name}:`, err.message);
      errors++;
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Processed: ${created}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log('\n🌱 Seeding complete!');
}

seed();
