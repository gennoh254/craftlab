import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SkillEntry {
  id: string;
  name: string;
  description: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

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
  skills_detailed?: SkillEntry[];
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
  contact_email?: string;
  contact_phone?: string;
  media_links?: MediaLinks;
  address?: string;
  professional_summary?: string;
  employment_history?: EmploymentEntry[];
}

export interface MediaLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  behance?: string;
  dribbble?: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  course: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface EmploymentEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string;
  category: 'Bachelors' | 'Diploma' | 'Masters' | 'PhD' | 'Certification' | 'Certificate';
  description: string;
  certificate_url: string;
  created_at: string;
  updated_at: string;
}
