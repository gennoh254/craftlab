# CraftLab AI Matching System

## Overview

The CraftLab platform now features a comprehensive AI-powered matching system that connects interns, attachees, apprentices, and volunteers with relevant opportunities posted by organizations. The system analyzes user profiles, skills, portfolios, and preferences to provide intelligent opportunity recommendations.

## Key Features

### 1. Organization Opportunity Posting

Organizations can now directly post opportunities without requiring admin privileges:

- **Direct Posting**: Organization accounts can create, edit, and delete their own job opportunities
- **Profile-Based Access**: Uses the profile ID system for secure opportunity management
- **Full Control**: Organizations manage only their own posted opportunities

### 2. Enhanced AI Matching Algorithm

The AI matcher now considers multiple factors with weighted scoring:

#### Scoring Breakdown (Total: 100 points)

- **User Type Compatibility (20 points)**
  - Perfect match for attachee → attachment (25 points → scaled to 20)
  - Perfect match for intern → internship (25 points → scaled to 20)
  - Cross-type matches get proportional scores

- **Skills Match (30 points)**
  - Compares user skills against opportunity requirements
  - Supports partial matching and skill variations
  - Provides detailed match percentages
  - Shows number of matched skills

- **Portfolio Strength (15 points) - NEW**
  - 3+ videos: 15 points - "Impressive portfolio with multiple projects"
  - 2 videos: 12 points - "Good portfolio showcasing work"
  - 1 video: 8 points - "Portfolio demonstrates capabilities"
  - CV uploaded: 5 points - "Professional CV uploaded"

- **Profile Completion (10 points) - NEW**
  - 80%+ completion: 10 points - "Strong profile completion"
  - 60%+ completion: 6 points
  - Below 60%: 0 points

- **Location Preference (10 points)**
  - Exact location match: 10 points
  - Remote/hybrid: 7 points - "Offers flexible work arrangement"

- **Work Type Preference (10 points)**
  - Matches user's preferred work type (remote/onsite/hybrid)

- **Industry Match (5 points)**
  - Bonus for industry alignment with user interests

### 3. Portfolio Integration

The system now actively considers portfolio content in matching:

- **Video Portfolio Weight**: Users with portfolio videos get significantly higher match scores
- **Quality Over Quantity**: Multiple high-quality videos indicate serious candidates
- **CV Recognition**: Professional CVs boost matching scores
- **Profile Completeness**: Complete profiles rank higher in matches

### 4. Database Schema Updates

New fields added to support enhanced matching:

**Opportunities Table:**
- `created_by` (uuid): References profile ID of organization that posted the opportunity
- Allows both organizations and admins to post opportunities

**Profiles Table:**
- `portfolio_url` (text): Link to external portfolio
- `cv_url` (text): Uploaded CV file URL
- `cv_uploaded_at` (timestamptz): CV upload timestamp

**Database Functions:**
- `calculate_match_score()`: PostgreSQL function for server-side matching
- Indexes added for performance optimization

### 5. Row Level Security (RLS) Policies

Enhanced security for opportunity management:

- **View Policy**: Users can see all active opportunities + their own inactive ones
- **Create Policy**: Organizations and admins can create opportunities
- **Update Policy**: Only creators and admins can update opportunities
- **Delete Policy**: Only creators and admins can delete opportunities

## Usage Guide

### For Interns/Attachees

1. **Complete Your Profile**
   - Fill in all sections (skills, experience, education)
   - Aim for 80%+ completion for better matches

2. **Build Your Portfolio**
   - Upload portfolio videos showcasing your work
   - Upload your professional CV
   - Add portfolio URL if available

3. **Set Preferences**
   - Choose work type preference (remote/onsite/hybrid)
   - Select industries of interest
   - Update location information

4. **View Matches**
   - Dashboard shows AI-matched opportunities
   - Match scores range from 0-100%
   - Match reasons explain why opportunities fit

5. **Apply Strategically**
   - Focus on high-match opportunities (80%+)
   - Review match reasons before applying
   - Customize applications per opportunity

### For Organizations

1. **Create Organization Account**
   - Register as user type "organization"
   - Complete your organization profile

2. **Post Opportunities**
   - Navigate to /opportunities page
   - Click "Post Opportunity" button
   - Fill in all required fields:
     - Title, company, location
     - Opportunity type (internship/attachment/etc)
     - Salary, description, deadline
     - Required skills and qualifications

3. **Manage Your Opportunities**
   - View all your posted opportunities
   - Edit opportunity details
   - Activate/deactivate postings
   - Delete old opportunities

4. **Review Applications**
   - See who applied to your opportunities
   - Review candidate profiles and portfolios
   - Check match scores to find best fits

## Technical Implementation

### Frontend Components

**New/Updated Files:**
- `/src/pages/Opportunities.tsx` - Opportunity browsing and posting page
- `/src/hooks/useOpportunities.ts` - Enhanced with profile ID support
- `/src/utils/aiMatcher.ts` - Updated matching algorithm
- `/src/components/Header.tsx` - Added Opportunities link
- `/src/App.tsx` - Added Opportunities route

### Database Migration

Migration file: `enhance_opportunity_matching.sql`

Key changes:
- Added `created_by` field to opportunities
- Added portfolio fields to profiles
- Updated RLS policies for organization access
- Created performance indexes
- Added PostgreSQL matching function

### API Integration

The system uses Supabase for:
- **Authentication**: User and organization login
- **Database**: PostgreSQL with RLS
- **Storage**: Portfolio videos and CVs
- **Real-time**: Live opportunity updates

## Matching Algorithm Details

### Skills Matching

```javascript
// Extracts all user skills
userSkills = programming + design + data + business + marketing

// Compares against opportunity requirements
matchedSkills = userSkills ∩ requiredSkills

// Calculates percentage
matchPercentage = (matchedSkills / requiredSkills) * 100

// Applies scoring
score = min((matchPercentage / 100) * 30, 30)
```

### Portfolio Scoring

```javascript
if (videosCount >= 3) {
  score = 15
  reason = "Impressive portfolio with multiple projects"
} else if (videosCount >= 2) {
  score = 12
  reason = "Good portfolio showcasing work"
} else if (videosCount >= 1) {
  score = 8
  reason = "Portfolio demonstrates capabilities"
} else if (cvUrl) {
  score = 5
  reason = "Professional CV uploaded"
}
```

### Type Compatibility

```javascript
attachee + attachment = 20 points (perfect match)
intern + internship = 20 points (perfect match)
attachee + internship = 16 points (good match)
intern + attachment = 16 points (good match)
```

## Best Practices

### For Better Matches

1. **Complete Profile**: Aim for 80%+ completion
2. **Add Skills**: List all relevant technical and soft skills
3. **Upload Videos**: Showcase 2-3 quality portfolio videos
4. **Professional CV**: Upload well-formatted CV
5. **Set Preferences**: Accurate location and work type preferences
6. **Regular Updates**: Keep profile current with new skills

### For Organizations

1. **Clear Requirements**: Specify exact skills needed
2. **Detailed Descriptions**: Write comprehensive job descriptions
3. **Realistic Expectations**: Match requirements to opportunity level
4. **Regular Updates**: Keep opportunities current
5. **Quick Response**: Review applications promptly

## Future Enhancements

Potential improvements for the AI matching system:

1. **Machine Learning**: Train models on successful placements
2. **Semantic Matching**: Natural language processing for descriptions
3. **Video Analysis**: AI analysis of portfolio video content
4. **Collaboration Filtering**: Learn from similar user preferences
5. **Dynamic Weights**: Adjust scoring weights based on success rates
6. **Skill Recommendations**: Suggest skills to learn for better matches
7. **Interview Scheduling**: Integrate calendar for high-match candidates
8. **Feedback Loop**: Improve matching based on hire outcomes

## Testing the System

### Test Scenario 1: Intern Matching

1. Create intern account
2. Add programming skills (JavaScript, React, Python)
3. Upload 2 portfolio videos
4. Set preferences: remote work, tech industry
5. Expected: 80%+ matches for remote programming internships

### Test Scenario 2: Organization Posting

1. Create organization account
2. Navigate to /opportunities
3. Post internship with JavaScript/React requirements
4. Verify opportunity appears in listings
5. Check that interns with matching skills see high match scores

### Test Scenario 3: Portfolio Impact

1. Create two similar profiles
2. Profile A: 3 videos + CV
3. Profile B: No videos, no CV
4. Same opportunity
5. Expected: Profile A gets 15-20 points higher match score

## Support

For issues with the AI matching system:
- Check browser console for errors
- Verify Supabase connection
- Ensure profile is complete
- Confirm opportunity requirements are set
- Review RLS policies in Supabase dashboard

## Conclusion

The CraftLab AI matching system provides intelligent, automated connections between talent and opportunities. By considering skills, portfolios, preferences, and profile quality, the system helps both job seekers and organizations find the best matches efficiently.
