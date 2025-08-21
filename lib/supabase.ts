import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      media_files: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          file_type: 'image' | 'video'
          size: number
          drive_file_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          file_type: 'image' | 'video'
          size: number
          drive_file_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          file_type?: 'image' | 'video'
          size?: number
          drive_file_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}