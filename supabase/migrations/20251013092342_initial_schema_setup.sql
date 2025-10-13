/*
  # Enhanced CraftLab Schema with Social Features and Admin Dashboard
  
  1. Enhanced Tables
    - `profiles` - Enhanced with social features
    - `videos` - User portfolio videos
    - `follows` - User following system
    - `admin_users` - Admin access control
    - Enhanced opportunities and applications
  
  2. Security
    - RLS policies for all tables
    - Admin-only access for management
    - Public profile viewing with privacy controls
*/

-- Create enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  user_type text DEFAULT 'attachee',
  bio text,
  location text,
  phone text,
  website text,
  skills jsonb DEFAULT '{"programming": [], "design": [], "data": [], "business": [], "marketing": []}',
  experience text,
  education text,
  preferences jsonb DEFAULT '{"workType": "hybrid", "salaryRange": "", "industries": []}',
  profile_picture text,
  completion_score integer DEFAULT 0,
  is_public boolean DEFAULT true,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  videos_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create videos table for portfolio videos
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer,
  file_size bigint,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follows table for social features
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'admin',
  permissions jsonb DEFAULT '{"can_view_users": true, "can_post_jobs": true, "can_manage_users": false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  issuer text,
  university text,
  date text,
  status text DEFAULT 'pending',
  file_url text,
  verified_by uuid REFERENCES admin_users(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enhanced opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  salary text,
  deadline timestamptz,
  description text,
  requirements jsonb DEFAULT '{"skills": [], "experience": "", "education": ""}',
  benefits text[],
  work_type text DEFAULT 'hybrid',
  industry text,
  posted_by uuid REFERENCES admin_users(id),
  is_active boolean DEFAULT true,
  applications_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  cover_letter text,
  additional_info text,
  resume_url text,
  portfolio_videos uuid[],
  reviewed_by uuid REFERENCES admin_users(id),
  reviewed_at timestamptz,
  applied_date timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT TO authenticated
  USING (is_public = true OR auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Videos policies
CREATE POLICY "Public videos are viewable by everyone" ON videos
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE is_public = true OR auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own videos" ON videos
  FOR ALL TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Follows policies
CREATE POLICY "Users can view follows" ON follows
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage own follows" ON follows
  FOR ALL TO authenticated
  USING (follower_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Admin users policies (only admins can see admin table)
CREATE POLICY "Only admins can view admin users" ON admin_users
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM admin_users));

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR 
         auth.uid() IN (SELECT auth_user_id FROM admin_users));

CREATE POLICY "Users can manage own certificates" ON certificates
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can update certificates" ON certificates
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM admin_users));

-- Opportunities policies
CREATE POLICY "Everyone can view active opportunities" ON opportunities
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage opportunities" ON opportunities
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM admin_users));

-- Applications policies
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR 
         auth.uid() IN (SELECT auth_user_id FROM admin_users));

CREATE POLICY "Users can create applications" ON applications
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can update applications" ON applications
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM admin_users));

-- Create functions for updating counts
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_videos_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET videos_count = videos_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET videos_count = videos_count - 1 WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE opportunities SET applications_count = applications_count + 1 WHERE id = NEW.opportunity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE opportunities SET applications_count = applications_count - 1 WHERE id = OLD.opportunity_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER followers_count_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_followers_count();

CREATE TRIGGER videos_count_trigger
  AFTER INSERT OR DELETE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_videos_count();

CREATE TRIGGER applications_count_trigger
  AFTER INSERT OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_applications_count();

-- Insert sample opportunities
INSERT INTO opportunities (title, company, location, type, salary, description, requirements, benefits, work_type, industry, is_active) VALUES
('Software Development Internship', 'TechCorp Kenya', 'Nairobi, Kenya', 'internship', 'KSh 25,000/month', 'Join our development team to build cutting-edge web applications using modern technologies.', '{"skills": ["JavaScript", "React", "Node.js", "Git"], "experience": "Basic programming knowledge", "education": "Computer Science or related field"}', ARRAY['Mentorship', 'Flexible hours', 'Learning opportunities', 'Certificate'], 'hybrid', 'Technology', true),
('Digital Marketing Volunteer', 'NGO Impact', 'Remote', 'volunteer', 'Volunteer', 'Help us create impactful digital campaigns for social causes.', '{"skills": ["Social Media", "Content Creation", "Analytics"], "experience": "Basic marketing knowledge", "education": "Any field"}', ARRAY['Social impact', 'Portfolio building', 'Networking', 'Reference letter'], 'remote', 'Non-profit', true),
('Data Analysis Attachment', 'Analytics Plus', 'Mombasa, Kenya', 'attachment', 'KSh 20,000/month', 'Work with our data science team to analyze business metrics and create insights.', '{"skills": ["Python", "SQL", "Excel", "Statistics"], "experience": "Academic data analysis projects", "education": "Statistics, Mathematics, or Computer Science"}', ARRAY['Real-world experience', 'Industry exposure', 'Mentorship', 'Job opportunity'], 'onsite', 'Analytics', true),
('UI/UX Design Apprenticeship', 'Creative Studio', 'Nairobi, Kenya', 'apprenticeship', 'KSh 30,000/month', 'Learn design thinking and create user-centered digital experiences.', '{"skills": ["Figma", "Adobe Creative Suite", "Design Thinking"], "experience": "Portfolio of design work", "education": "Design or related field"}', ARRAY['Hands-on training', 'Portfolio development', 'Industry connections', 'Certification'], 'hybrid', 'Design', true),
('Business Development Internship', 'StartupHub', 'Nairobi, Kenya', 'internship', 'KSh 22,000/month', 'Support our business development team in market research and client acquisition.', '{"skills": ["Market Research", "Communication", "Excel", "Presentation"], "experience": "Business or sales interest", "education": "Business, Economics, or related field"}', ARRAY['Startup experience', 'Networking', 'Sales training', 'Performance bonus'], 'onsite', 'Business', true);