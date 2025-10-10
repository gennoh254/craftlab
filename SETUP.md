# CraftLab Setup Guide

Complete setup instructions for the CraftLab Career Development Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Git (optional)

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Run Database Migration
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the migration from `supabase/migrations/enhanced_schema.sql`
4. Click **Run**

#### Set Up Storage Buckets
1. Go to **Storage** in Supabase dashboard
2. Create these buckets:
   - `profile-pictures` (Public read access)
   - `certificates` (Private access)
   - `videos` (Private access)

#### Configure Authentication
1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Disable "Confirm email" for testing
4. Enable "Allow new users to sign up"

### 4. Create Admin Account

1. Register a normal user account first
2. Go to **Authentication** → **Users** in Supabase
3. Copy your user ID
4. Run this SQL to make yourself admin:

```sql
INSERT INTO admin_users (auth_user_id, name, email, role, permissions) VALUES
('your-user-id-here', 'Your Name', 'your-email@example.com', 'super_admin', 
 '{"can_view_users": true, "can_post_jobs": true, "can_manage_users": true}');
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | Yes |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | Yes |

### Database Configuration

The platform uses PostgreSQL via Supabase with the following main tables:
- `profiles` - User profile information
- `videos` - User portfolio videos
- `certificates` - User credentials
- `opportunities` - Job/internship postings
- `applications` - User applications
- `follows` - User following relationships
- `admin_users` - Admin access control

## 🎯 Features Overview

### For Users
- **Profile Management** - Complete profile with skills, experience, education
- **Video Portfolio** - Upload and showcase work videos
- **Social Networking** - Follow other users and discover talent
- **AI Matching** - Get matched with relevant opportunities
- **Certificate Verification** - Upload and verify credentials
- **Application Tracking** - Track application status

### For Admins
- **User Management** - View and manage all users
- **Job Posting** - Create and manage opportunities
- **Analytics Dashboard** - Platform statistics and insights
- **Content Moderation** - Manage user content
- **Data Export** - Export user data for analysis

## 🔒 Security

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Public data is readable by authenticated users
- Admin users have elevated permissions

### File Storage Security
- Profile pictures: Public read access
- Certificates: Private, user-only access
- Videos: Private, user-only access

## 🚨 Troubleshooting

### Common Issues

#### "Supabase request failed" Error
- Check your environment variables
- Ensure Supabase project is active
- Verify database migration was successful

#### Profile Not Found Error
- The system auto-creates profiles on first login
- Check if user is properly authenticated
- Verify RLS policies are correct

#### File Upload Issues
- Ensure storage buckets are created
- Check bucket policies and permissions
- Verify file size limits

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## 📞 Support

For technical support:
- Check the troubleshooting section
- Review error logs in browser console
- Check Supabase logs for database issues
- Contact development team

## 🔄 Updates

To update the platform:
1. Pull latest changes
2. Run `npm install` for new dependencies
3. Check for new migrations in `supabase/migrations/`
4. Update environment variables if needed
5. Restart development server