import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          auth_user_id: string
          name: string
          email: string
          user_type: string
          bio: string | null
          location: string | null
          phone: string | null
          website: string | null
          skills: any
          experience: string | null
          education: string | null
          preferences: any
          profile_picture: string | null
          completion_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          name: string
          email: string
          user_type?: string
          bio?: string | null
          location?: string | null
          phone?: string | null
          website?: string | null
          skills?: any
          experience?: string | null
          education?: string | null
          preferences?: any
          profile_picture?: string | null
          completion_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          name?: string
          email?: string
          user_type?: string
          bio?: string | null
          location?: string | null
          phone?: string | null
          website?: string | null
          skills?: any
          experience?: string | null
          education?: string | null
          preferences?: any
          profile_picture?: string | null
          completion_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          name: string
          issuer: string | null
          university: string | null
          date: string | null
          status: string
          file_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          issuer?: string | null
          university?: string | null
          date?: string | null
          status?: string
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          issuer?: string | null
          university?: string | null
          date?: string | null
          status?: string
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          title: string
          company: string
          location: string
          type: string
          salary: string | null
          deadline: string | null
          description: string | null
          requirements: any
          benefits: string[] | null
          work_type: string
          industry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          location: string
          type: string
          salary?: string | null
          deadline?: string | null
          description?: string | null
          requirements?: any
          benefits?: string[] | null
          work_type?: string
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          location?: string
          type?: string
          salary?: string | null
          deadline?: string | null
          description?: string | null
          requirements?: any
          benefits?: string[] | null
          work_type?: string
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          opportunity_id: string
          status: string
          cover_letter: string | null
          additional_info: string | null
          applied_date: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          opportunity_id: string
          status?: string
          cover_letter?: string | null
          additional_info?: string | null
          applied_date?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          opportunity_id?: string
          status?: string
          cover_letter?: string | null
          additional_info?: string | null
          applied_date?: string
          updated_at?: string
        }
      }
    }
  }
}