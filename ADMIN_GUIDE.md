# CraftLab Admin Guide

Complete guide for administrators managing the CraftLab Career Development Platform.

## 🔐 Admin Access

### Getting Admin Access

1. **Create Regular Account** - Register as a normal user first
2. **Get User ID** - Find your user ID in Supabase Authentication panel
3. **Grant Admin Rights** - Run SQL command to add admin permissions:

```sql
INSERT INTO admin_users (auth_user_id, name, email, role, permissions) VALUES
('your-user-id-here', 'Your Name', 'admin@craftlab.com', 'super_admin', 
 '{"can_view_users": true, "can_post_jobs": true, "can_manage_users": true}');
```

### Admin Roles

- **Super Admin** - Full platform access and control
- **Admin** - User management and job posting
- **Moderator** - Content moderation and user support
- **Recruiter** - Job posting and application management

## 📊 Admin Dashboard

### Accessing Admin Dashboard

1. **Login** - Use your admin account credentials
2. **Navigate to Admin** - Go to `/admin` URL or use admin menu
3. **Dashboard Overview** - View platform statistics and metrics

### Dashboard Sections

#### **Overview Tab**
- **Platform Statistics** - Total users, jobs, applications
- **Growth Metrics** - User registration trends
- **Activity Monitoring** - Recent platform activity
- **System Health** - Platform performance indicators

#### **Users Tab**
- **User Management** - View, edit, and manage all users
- **User Statistics** - Detailed user analytics
- **Export Functions** - Download user data
- **Account Actions** - Suspend, activate, or delete accounts

#### **Jobs Tab**
- **Job Management** - Create, edit, and manage opportunities
- **Application Tracking** - Monitor job applications
- **Job Analytics** - Performance metrics for postings
- **Bulk Operations** - Manage multiple jobs at once

#### **Settings Tab**
- **Platform Configuration** - System-wide settings
- **Admin Management** - Add/remove admin users
- **Security Settings** - Access controls and permissions
- **Integration Settings** - Third-party service configurations

## 👥 User Management

### Viewing Users

#### **User List**
- **Search Users** - Find users by name, email, or type
- **Filter Options** - Filter by user type, registration date, activity
- **Sort Options** - Sort by various criteria
- **Bulk Actions** - Perform actions on multiple users

#### **User Details**
- **Profile Information** - Complete user profile data
- **Activity History** - User actions and engagement
- **Application History** - Jobs applied to and status
- **Social Metrics** - Followers, following, videos uploaded

### User Actions

#### **Account Management**
- **View Profile** - See complete user profile
- **Edit Information** - Update user details if needed
- **Account Status** - Active, suspended, or deleted
- **Reset Password** - Help users with login issues

#### **Content Moderation**
- **Review Videos** - Check uploaded portfolio videos
- **Verify Certificates** - Validate user credentials
- **Moderate Content** - Remove inappropriate content
- **Handle Reports** - Address user-reported issues

### User Analytics

#### **Registration Metrics**
- **Daily Signups** - New user registrations
- **User Types** - Distribution of user categories
- **Geographic Data** - User locations and demographics
- **Retention Rates** - User engagement over time

#### **Engagement Analytics**
- **Profile Completion** - Average completion scores
- **Video Uploads** - Portfolio video statistics
- **Social Activity** - Following and networking metrics
- **Application Activity** - Job application patterns

## 💼 Job Management

### Creating Opportunities

#### **Job Posting Form**
1. **Basic Information**
   - **Job Title** - Clear, descriptive title
   - **Company Name** - Hiring organization
   - **Location** - Job location or "Remote"
   - **Job Type** - Internship, attachment, apprenticeship, volunteer

2. **Job Details**
   - **Salary/Compensation** - Payment information
   - **Description** - Detailed job description
   - **Requirements** - Skills, experience, education needed
   - **Benefits** - What the position offers

3. **Advanced Settings**
   - **Work Type** - Remote, onsite, or hybrid
   - **Industry** - Relevant industry category
   - **Application Deadline** - Last date to apply
   - **Status** - Active or inactive

#### **Job Requirements Format**
```json
{
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": "1-2 years web development",
  "education": "Computer Science or related field"
}
```

### Managing Opportunities

#### **Job List View**
- **All Jobs** - Complete list of opportunities
- **Filter Options** - By status, type, company, date
- **Search Function** - Find specific jobs quickly
- **Bulk Actions** - Activate/deactivate multiple jobs

#### **Job Actions**
- **Edit Job** - Update job information
- **View Applications** - See all applicants
- **Activate/Deactivate** - Control job visibility
- **Delete Job** - Remove job permanently
- **Duplicate Job** - Create similar positions

### Application Management

#### **Application Overview**
- **Application List** - All applications across platform
- **Filter by Job** - See applications for specific positions
- **Filter by Status** - Pending, accepted, rejected applications
- **Applicant Details** - Complete applicant profiles

#### **Application Actions**
- **Review Applications** - Assess candidate suitability
- **Update Status** - Change application status
- **Contact Applicants** - Communicate with candidates
- **Export Data** - Download application information

## 📈 Analytics & Reporting

### Platform Analytics

#### **User Metrics**
- **Total Users** - Platform user count
- **Active Users** - Recently active users
- **User Growth** - Registration trends over time
- **User Types** - Distribution of user categories

#### **Engagement Metrics**
- **Profile Completions** - Average completion rates
- **Video Uploads** - Portfolio video statistics
- **Social Interactions** - Following and networking activity
- **Application Rates** - Job application frequency

#### **Job Metrics**
- **Total Opportunities** - Number of posted jobs
- **Application Rates** - Applications per job
- **Success Rates** - Hiring success metrics
- **Popular Industries** - Most active job sectors

### Custom Reports

#### **User Reports**
- **User Demographics** - Age, location, education data
- **Skill Analysis** - Most common skills and gaps
- **Activity Reports** - User engagement patterns
- **Success Stories** - Successful placements and outcomes

#### **Job Reports**
- **Job Performance** - Application rates and success
- **Industry Trends** - Popular job types and sectors
- **Geographic Distribution** - Job locations and preferences
- **Salary Analysis** - Compensation trends and ranges

### Data Export

#### **Export Options**
- **CSV Format** - Spreadsheet-compatible data
- **JSON Format** - Structured data for analysis
- **PDF Reports** - Formatted reports for presentation
- **Custom Queries** - Specific data extractions

#### **Export Categories**
- **User Data** - Complete user information
- **Job Data** - Opportunity and application data
- **Analytics Data** - Platform metrics and trends
- **Activity Logs** - User actions and system events

## 🔧 Platform Configuration

### System Settings

#### **General Settings**
- **Platform Name** - Customize platform branding
- **Contact Information** - Support contact details
- **Terms of Service** - Legal terms and conditions
- **Privacy Policy** - Data protection policies

#### **Feature Toggles**
- **User Registration** - Enable/disable new signups
- **Video Uploads** - Control video upload feature
- **Social Features** - Enable/disable following system
- **AI Matching** - Toggle AI recommendation system

### Security Configuration

#### **Access Controls**
- **Admin Permissions** - Define admin role capabilities
- **User Permissions** - Set user access levels
- **Content Moderation** - Automatic content filtering
- **Rate Limiting** - Prevent abuse and spam

#### **Data Protection**
- **Backup Settings** - Automated data backups
- **Retention Policies** - Data storage duration
- **Privacy Controls** - User data protection
- **Audit Logging** - Track admin actions

## 🛠 Technical Administration

### Database Management

#### **Direct Database Access**
- **Supabase Dashboard** - Web-based database interface
- **SQL Editor** - Run custom database queries
- **Table Editor** - View and edit data directly
- **Real-time Logs** - Monitor database activity

#### **Common Admin Queries**

**View All Users:**
```sql
SELECT name, email, user_type, created_at, completion_score 
FROM profiles 
ORDER BY created_at DESC;
```

**Job Application Statistics:**
```sql
SELECT o.title, o.company, COUNT(a.id) as applications
FROM opportunities o
LEFT JOIN applications a ON o.id = a.opportunity_id
GROUP BY o.id, o.title, o.company
ORDER BY applications DESC;
```

**User Activity Summary:**
```sql
SELECT 
  p.name,
  p.user_type,
  p.followers_count,
  p.videos_count,
  COUNT(a.id) as applications_submitted
FROM profiles p
LEFT JOIN applications a ON p.id = a.user_id
GROUP BY p.id, p.name, p.user_type, p.followers_count, p.videos_count
ORDER BY applications_submitted DESC;
```

### File Storage Management

#### **Storage Buckets**
- **profile-pictures** - User profile images
- **certificates** - User credential files
- **videos** - Portfolio video files

#### **Storage Policies**
- **Public Access** - Profile pictures (read-only)
- **Private Access** - Certificates and videos (user-only)
- **Size Limits** - File size restrictions
- **Format Restrictions** - Allowed file types

### System Monitoring

#### **Performance Metrics**
- **Response Times** - API endpoint performance
- **Error Rates** - System error frequency
- **Database Performance** - Query execution times
- **Storage Usage** - File storage consumption

#### **Health Checks**
- **Service Status** - All system components
- **Database Connectivity** - Connection health
- **External Integrations** - Third-party service status
- **Backup Status** - Data backup verification

## 🚨 Troubleshooting

### Common Issues

#### **User Issues**
- **Login Problems** - Password resets and account access
- **Profile Issues** - Data corruption or missing information
- **Upload Failures** - File upload problems
- **Application Errors** - Job application submission issues

#### **System Issues**
- **Performance Problems** - Slow response times
- **Database Errors** - Connection or query issues
- **Storage Problems** - File upload or access issues
- **Integration Failures** - Third-party service problems

### Resolution Procedures

#### **User Support**
1. **Identify Issue** - Understand the problem
2. **Check Logs** - Review system and user logs
3. **Reproduce Issue** - Verify the problem
4. **Apply Fix** - Implement solution
5. **Verify Resolution** - Confirm fix works
6. **Document Solution** - Record for future reference

#### **System Maintenance**
1. **Monitor Alerts** - Watch for system notifications
2. **Investigate Issues** - Analyze problems thoroughly
3. **Plan Maintenance** - Schedule necessary updates
4. **Execute Changes** - Implement fixes carefully
5. **Test Results** - Verify system functionality
6. **Update Documentation** - Record changes made

## 📞 Support & Escalation

### Support Channels

#### **User Support**
- **Help Desk** - Direct user support
- **Email Support** - Asynchronous assistance
- **Live Chat** - Real-time help
- **Knowledge Base** - Self-service resources

#### **Technical Support**
- **System Alerts** - Automated issue detection
- **Monitoring Tools** - Performance tracking
- **Log Analysis** - Issue investigation
- **Escalation Procedures** - Critical issue handling

### Escalation Matrix

#### **Severity Levels**
- **Critical** - System down, data loss
- **High** - Major functionality impaired
- **Medium** - Minor functionality issues
- **Low** - Enhancement requests, minor bugs

#### **Response Times**
- **Critical** - Immediate response (< 1 hour)
- **High** - Same day response (< 4 hours)
- **Medium** - Next business day (< 24 hours)
- **Low** - Within 3 business days (< 72 hours)

---

**Admin Success Tips:**
- **Stay Informed** - Monitor platform metrics regularly
- **Be Proactive** - Address issues before they become problems
- **Document Everything** - Keep detailed records of actions and decisions
- **Communicate Clearly** - Keep users informed of changes and issues
- **Continuous Learning** - Stay updated on platform features and best practices