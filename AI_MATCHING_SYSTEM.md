# AI-Powered Student-to-Opportunity Matching System

## Overview

The system uses Supabase Edge Functions to run intelligent matching analysis that connects students with opportunities based on their profile data. Students must complete at least 50% of their profile before running the analysis.

## Components

### 1. Student Profile Fields

Enhanced profile with the following data:
- **Contact Information**: Email, Phone, Address
- **Professional Data**: Professional Summary, Media Links (LinkedIn, GitHub, Portfolio, Twitter)
- **Skills**: Comma-separated list of skills
- **Education**: Array of education entries with institution, degree, course, dates
- **Employment History**: Array of employment entries with company, role, dates, description
- **Certificates**: Uploaded files with metadata (title, issuer, category, description, date)

### 2. Edge Function: `match_student_to_opportunities`

**Location**: `supabase/functions/match_student_to_opportunities/index.ts`

**How it Works**:
1. Receives student ID from frontend
2. Validates profile completion (must be at least 50%)
3. Fetches student profile and all active opportunities
4. Runs matching algorithm:
   - Compares student skills against required skills for each opportunity
   - Calculates skill match ratio (0-50 points)
   - Awards points for completed sections (education, employment, summary)
   - Generates match scores (0-100)
5. Filters opportunities with score >= 40
6. Returns top 10 matches sorted by score
7. Stores matches in `student_matches` table

**Profile Completion Checker**:
- Skills (required)
- Professional Summary (minimum 50 characters)
- Education entries
- Contact Email
- Contact Phone
- Address

**Scoring Algorithm**:
- Skill match: 50 points maximum (based on matched skills ratio)
- Education: 20 points (if has education entries)
- Employment: 15 points (if has employment history)
- Professional Summary: 15 points (if summary > 50 characters)

### 3. Database Table: `student_matches`

```sql
CREATE TABLE student_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  match_score integer NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  matched_skills text[] DEFAULT '{}',
  reasoning text,
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, opportunity_id)
);
```

**RLS Policies**:
- Students can view their own matches
- Service role can insert matches

### 4. UI: `ViewMatchesPage`

#### Two Tabs for Students:

**Tab 1: Run Analysis**
- Shows profile completion status with visual progress bar
- Lists all required/optional profile fields with completion checkmarks
- Displays completion percentage
- "Run Analysis" button (disabled if < 50% complete)
- Shows profile completion warnings with link to edit profile
- Displays error messages if analysis fails
- Shows success message after successful analysis

**Tab 2: Matched Opportunities**
- Displays all matched opportunities
- Shows:
  - Opportunity role and organization name
  - Match score (0-100%) with prominent display
  - Reasoning for the match
  - Matched skills (up to 4 shown, with "+X more" if additional)
  - "Apply Now" button to apply directly
- Sorted by match score (highest first)
- Empty state with CTA to run analysis

#### For Organizations:
- Shows applications received from students
- Filter by status (All, pending, shortlisted, rejected)
- Update application status with Shortlist/Reject buttons
- Search and refresh functionality

## User Flow

### For Students:

1. **Profile Completion**
   - Student navigates to "Edit Profile"
   - Fills in all required information (contacts, skills, education, etc.)
   - Uploads certificates if needed
   - Saves changes

2. **Running Analysis**
   - Goes to "My Top Matches" → "Run Analysis" tab
   - System shows profile completion status
   - If < 50% complete: Cannot run, shown what to complete
   - If >= 50% complete: Button enabled, clicks "Run Analysis"
   - AI engine analyzes profile against all opportunities
   - Calculates match scores based on skills and profile data

3. **Viewing Results**
   - Switches to "Matched Opportunities" tab
   - Sees all matched opportunities sorted by match percentage
   - Views detailed matching reasoning and matched skills
   - Clicks "Apply Now" to apply for specific opportunities

### For Organizations:

1. **View Applications**
   - Goes to "My Top Matches" → "Talent Pipeline"
   - Sees all applications received from students
   - Can filter by status
   - Can shortlist or reject pending applications
   - View student profiles

## API Integration

### Calling the Edge Function from Frontend

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/match_student_to_opportunities`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ studentId: user.id }),
  }
);

const data = await response.json();
```

### Response on Success

```json
{
  "success": true,
  "completionPercentage": 83,
  "totalMatches": 12,
  "topMatches": [
    {
      "opportunity_id": "uuid",
      "student_id": "uuid",
      "match_score": 85,
      "matched_skills": ["React", "TypeScript", "UI/UX"],
      "reasoning": "Matched 3 of 4 required skills for Product Designer"
    }
  ]
}
```

### Response on Error

```json
{
  "error": "Profile incomplete",
  "message": "Please complete at least 50% of your profile to run matching analysis",
  "completionPercentage": 45,
  "requiredFields": {
    "skills": false,
    "professionalSummary": false,
    "education": true,
    "contactEmail": false,
    "contactPhone": true,
    "address": true
  }
}
```

## Database Migrations Needed

Run these in your Supabase SQL Editor:

**Migration 1 - Add Profile Fields**
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS media_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS professional_summary text,
ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS employment_history jsonb DEFAULT '[]'::jsonb;
```

**Migration 2 - Create Certificates Table** (Already applied)
```sql
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  issuer text NOT NULL,
  issue_date date,
  category text NOT NULL,
  description text,
  certificate_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Migration 3 - Create Student Matches Table** (Already applied)
```sql
CREATE TABLE IF NOT EXISTS student_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  match_score integer NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  matched_skills text[] DEFAULT '{}',
  reasoning text,
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, opportunity_id)
);
```

## Features

✅ Profile completion validation (50% minimum required)
✅ AI-powered matching algorithm based on skills and experience
✅ Real-time match score calculation
✅ Matched skills display
✅ Match reasoning explanation
✅ Top 10 matches returned
✅ One-click apply from matched results
✅ RLS-protected database access
✅ Responsive design for mobile and desktop
✅ Error handling with user-friendly messages
✅ Success feedback after analysis

## Testing the System

1. Create student profile with complete data (skills, education, email, phone, address, professional summary)
2. Ensure profile is at least 50% complete
3. Go to "My Top Matches" → "Run Analysis"
4. Click "Run Analysis" button
5. Wait for analysis to complete (should take 1-2 seconds)
6. Switch to "Matched Opportunities" tab
7. Review all matched opportunities with match scores and reasoning
8. Click "Apply Now" to apply for opportunities

## Future Enhancements

- Machine learning model for more sophisticated matching
- Skill weight customization by organizations
- Match filtering and sorting options
- Match history and analytics
- Notification system for new matches
- Batch re-analysis on profile updates
