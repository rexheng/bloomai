export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// Shop Item Types
// ============================================

export type ItemCategory = 'plant' | 'furniture' | 'wallpaper' | 'accessory';
export type ItemPlacementType = 'surface' | 'floor' | 'wall' | 'window';
export type ItemSize = 'small' | 'medium' | 'large';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface ShopItem {
  id: string;
  sprite_id: string;
  name: string;
  description: string | null;
  category: ItemCategory;
  placement_type: ItemPlacementType;
  size: ItemSize;
  point_cost: number;
  image_url: string;
  rarity: ItemRarity;
  is_premium_only: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ShopItemWithOwnership extends ShopItem {
  is_owned: boolean;
}

// ============================================
// Inventory Types
// ============================================

export interface UserItem {
  id: string;
  user_id: string;
  item_id: string;
  is_placed: boolean;
  placed_slot_id: string | null;
  unlocked_at: string;
}

export interface InventoryItem extends ShopItem {
  ownership_id: string;
  is_placed: boolean;
  placed_slot_id: string | null;
  unlocked_at: string;
}

// ============================================
// Room Configuration Types
// ============================================

export interface PlacedItemEntry {
  item_id: string;
  slot_id: string;
  placed_at: string;
}

export interface RoomConfig {
  id: string;
  user_id: string;
  wallpaper_id: string | null;
  placed_items: PlacedItemEntry[];
  updated_at: string;
}

export interface RoomConfigWithDetails extends RoomConfig {
  wallpaper?: ShopItem | null;
  placed_items_details: Array<PlacedItemEntry & { item: ShopItem }>;
}

// ============================================
// Purchase Types
// ============================================

export interface PurchaseResult {
  success: boolean;
  error?: string;
  new_balance?: number;
  item_id?: string;
  item_name?: string;
  item_category?: string;
  item_image_url?: string;
  current_price?: number;
  premium_required?: boolean;
  current_points?: number;
  item_cost?: number;
  points_needed?: number;
}

export interface PlaceItemResult {
  success: boolean;
  error?: string;
  slot_id?: string;
  item_name?: string;
}

export interface RemoveItemResult {
  success: boolean;
  error?: string;
  item_name?: string;
}

// ============================================
// Profile Types
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          total_points: number
          current_points: number
          current_streak: number
          longest_streak: number
          last_active_date: string | null
          is_premium: boolean
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
          messages_sent: number
          xp: number
          level: number
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          total_points?: number
          current_points?: number
          current_streak?: number
          longest_streak?: number
          last_active_date?: string | null
          is_premium?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
          messages_sent?: number
          xp?: number
          level?: number
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          total_points?: number
          current_points?: number
          current_streak?: number
          longest_streak?: number
          last_active_date?: string | null
          is_premium?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
          messages_sent?: number
          xp?: number
          level?: number
        }
      }
      items: {
        Row: ShopItem
        Insert: Omit<ShopItem, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<ShopItem>
      }
      user_items: {
        Row: UserItem
        Insert: Omit<UserItem, 'id' | 'unlocked_at'> & { id?: string; unlocked_at?: string }
        Update: Partial<UserItem>
      }
      room_config: {
        Row: RoomConfig
        Insert: Omit<RoomConfig, 'id' | 'updated_at'> & { id?: string; updated_at?: string }
        Update: Partial<RoomConfig>
      }
    }
  }
}
