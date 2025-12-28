export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
    }
  }
}
