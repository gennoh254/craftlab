import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  name: string;
  user_type: 'STUDENT' | 'ORGANIZATION';
  avatar_url?: string | null;
  banner_url?: string | null;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  skills?: any;
  experience?: string;
  education?: string;
  preferences?: any;
  completion_score?: number;
  is_public?: boolean;
  followers_count?: number;
  following_count?: number;
  videos_count?: number;
  created_at: string;
  updated_at: string;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
}
