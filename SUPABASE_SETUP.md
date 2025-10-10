# Supabase Setup Guide for CraftLab

This guide will help you set up Supabase for the CraftLab Career Development Platform.

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with GitHub
4. Click "New Project"
5. Choose your organization
6. Enter project details:
   - **Name**: `craftlab-career-platform`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
7. Click "Create new project"

### 2. Get Your Project Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Update Environment Variables
Update your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Database Migration
1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire content from `supabase/migrations/create_users_and_profiles.sql`
4. Click "Run" to execute the migration

## 📊 Database Schema

The migration creates these tables:

### `profiles`
- User profile information
- Links to Supabase Auth users
- Stores skills, preferences, and completion scores

### `certificates`
- User certificates and credentials
- File storage integration
- Verification status tracking

### `opportunities`
- Job/internship opportunities
- Requirements and benefits
- Company information

### `applications`
- User applications to opportunities
- Status tracking
- Cover letters and additional info

## 🔐 Authentication Setup

### Enable Email Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. **Disable** "Confirm email" for easier testing (optional)
4. **Enable** "Allow new users to sign up"

### Row Level Security (RLS)
The migration automatically sets up RLS policies:
- Users can only access their own data
- Opportunities are publicly readable
- Secure by default

## 📁 Storage Setup

### Create Storage Buckets
1. Go to **Storage** in your Supabase dashboard
2. Create these buckets:
   - `profile-pictures` (for user avatars)
   - `certificates` (for certificate files)

### Set Bucket Policies
For each bucket:
1. Click the bucket name
2. Go to **Policies**
3. Add these policies:

**Profile Pictures Bucket:**
```sql
-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload own profile pictures" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to profile pictures
CREATE POLICY "Public read access to profile pictures" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-pictures');
```

**Certificates Bucket:**
```sql
-- Allow authenticated users to upload their own certificates
CREATE POLICY "Users can upload own certificates" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own certificates
CREATE POLICY "Users can read own certificates" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🎯 Admin Dashboard Access

### View Users
1. Go to **Authentication** → **Users**
2. See all registered users
3. View user metadata and status

### Manage Database
1. Go to **Table Editor**
2. Browse all tables:
   - `profiles` - User profile data
   - `certificates` - User certificates
   - `opportunities` - Available opportunities
   - `applications` - User applications

### SQL Editor
1. Go to **SQL Editor**
2. Run custom queries
3. Export data as needed

### Example Admin Queries

**Get all users with profile completion:**
```sql
SELECT 
  p.name,
  p.email,
  p.user_type,
  p.completion_score,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;
```

**Get certificate statistics:**
```sql
SELECT 
  status,
  COUNT(*) as count
FROM certificates
GROUP BY status;
```

**Get application statistics:**
```sql
SELECT 
  o.company,
  o.title,
  COUNT(a.id) as applications
FROM opportunities o
LEFT JOIN applications a ON o.id = a.opportunity_id
GROUP BY o.id, o.company, o.title
ORDER BY applications DESC;
```

## 🔧 Development Tips

### Local Development
- The app works offline with localStorage fallback
- Supabase integration is seamless when available
- No need to run a separate backend server

### Testing
1. Register a test user through the app
2. Check the user appears in Supabase Auth
3. Verify profile is created in the `profiles` table
4. Test certificate uploads and opportunity applications

### Monitoring
1. Go to **Logs** to see real-time activity
2. Monitor API usage in **Settings** → **Usage**
3. Set up alerts for errors or high usage

## 🚨 Security Checklist

- ✅ RLS enabled on all tables
- ✅ Proper policies for user data access
- ✅ Storage bucket policies configured
- ✅ Environment variables secured
- ✅ Email confirmation disabled for testing (enable for production)

## 📞 Support

If you encounter issues:
1. Check the Supabase logs for errors
2. Verify your environment variables
3. Ensure the migration ran successfully
4. Check browser console for client-side errors

Your CraftLab platform is now connected to Supabase! Users can register, login, and all their data will be stored securely in your database.