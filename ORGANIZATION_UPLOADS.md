# Organization Upload Feature

## Overview

Organizations can now upload their company logo and official registration certificate through their dashboard. This enhances credibility and allows verification of legitimate organizations on the platform.

## Features Implemented

### 1. Database Changes

Added three new fields to the `profiles` table:
- `company_logo` (TEXT): URL to the uploaded company logo
- `registration_certificate` (TEXT): URL to the uploaded registration certificate
- `certificate_verification_status` (TEXT): Status of certificate verification (pending, verified, rejected)

### 2. Storage Buckets

Created two new Supabase storage buckets:

**company-logos** (Public)
- Public read access for displaying logos
- Organizations can upload/update/delete their own logos
- Recommended size: 400x400px
- Max file size: 5MB
- Accepted formats: PNG, JPG, SVG

**registration-certificates** (Private)
- Private access - only viewable by the organization that owns it
- Organizations can upload/update/delete their own certificates
- Max file size: 10MB
- Accepted formats: PDF, JPG, PNG

### 3. Frontend Updates

**Updated useProfile Hook:**
- Added `companyLogo`, `registrationCertificate`, and `certificateVerificationStatus` to UserProfile interface
- Added `uploadCompanyLogo()` function to handle logo uploads
- Added `uploadRegistrationCertificate()` function to handle certificate uploads
- Both functions include offline fallback support

**Updated Organization Dashboard:**
- Added upload state management: `uploadingLogo` and `uploadingRegCert`
- Added handler functions: `handleLogoUpload()` and `handleRegCertUpload()`
- Enhanced Profile tab with three sections:
  1. Organization Profile (existing fields)
  2. Company Logo upload section
  3. Registration Certificate upload section

### 4. Upload Handlers

**Logo Upload:**
- Validates file type (must be an image)
- Validates file size (max 5MB)
- Uploads to `company-logos` bucket
- Updates profile with logo URL
- Shows loading state during upload

**Certificate Upload:**
- Validates file type (PDF or image)
- Validates file size (max 10MB)
- Uploads to `registration-certificates` bucket
- Updates profile with certificate URL
- Sets verification status to 'pending'
- Shows loading state during upload

### 5. Verification Status Display

The registration certificate section shows different states:

**Pending:**
- Blue info box with message: "Verification in Progress"
- Indicates 1-2 business day processing time

**Verified:**
- Green success box with checkmark
- Message: "Certificate Verified"
- Organization can now post opportunities

**Rejected:**
- Red error indicator
- Organization needs to re-upload

## Usage

### For Organizations:

1. **Login** to your organization account
2. **Navigate** to Dashboard
3. **Click** on the "Profile" tab
4. **Scroll** to the upload sections

**To Upload Company Logo:**
1. Click "Upload Logo" button
2. Select an image file (PNG, JPG, SVG)
3. Wait for upload to complete
4. Logo will appear above the upload button

**To Upload Registration Certificate:**
1. Click "Upload Certificate" button
2. Select your registration document (PDF or image)
3. Wait for upload to complete
4. Certificate status will be set to "Pending"
5. Wait 1-2 business days for verification

### For Admins:

Admins can verify certificates through the Supabase dashboard:

```sql
-- To verify a certificate
UPDATE profiles
SET certificate_verification_status = 'verified'
WHERE id = 'organization-profile-id';

-- To reject a certificate
UPDATE profiles
SET certificate_verification_status = 'rejected'
WHERE id = 'organization-profile-id';
```

## Security Features

1. **Row Level Security (RLS):**
   - Organizations can only upload to their own folders
   - Private certificates are only accessible by the owner
   - Public logos are readable by everyone

2. **File Validation:**
   - Type checking for appropriate file formats
   - Size limits prevent abuse
   - Frontend and backend validation

3. **Authentication:**
   - All uploads require authentication
   - User ID is verified before allowing uploads
   - File paths are scoped to user folders

## Technical Details

### Storage Structure:

**Company Logos:**
```
company-logos/
  ├── {auth_user_id}/
  │   └── {timestamp}.{ext}
```

**Registration Certificates:**
```
registration-certificates/
  ├── {auth_user_id}/
  │   └── {timestamp}.{ext}
```

### Database Schema:

```sql
ALTER TABLE profiles ADD COLUMN company_logo TEXT;
ALTER TABLE profiles ADD COLUMN registration_certificate TEXT;
ALTER TABLE profiles ADD COLUMN certificate_verification_status TEXT DEFAULT 'pending';
```

### API Endpoints (via Supabase):

- `POST /storage/v1/object/company-logos/{user_id}/{filename}`
- `POST /storage/v1/object/registration-certificates/{user_id}/{filename}`
- `GET /storage/v1/object/public/company-logos/{user_id}/{filename}`

## Benefits

1. **Trust & Credibility:** Verified organizations build trust with candidates
2. **Professionalism:** Company logos enhance brand presence
3. **Compliance:** Registration certificates ensure legitimacy
4. **User Safety:** Candidates can verify organization authenticity
5. **Platform Quality:** Reduces fake or fraudulent organizations

## Future Enhancements

Potential improvements:
- Automated certificate verification via OCR
- Integration with government registration databases
- Certificate expiry tracking and renewal reminders
- Multiple certificate uploads (business license, tax certificate, etc.)
- Logo optimization and automatic resizing
- Certificate template validation

## Troubleshooting

**Logo not appearing:**
- Check file format (must be image)
- Verify file size (under 5MB)
- Clear browser cache
- Check Supabase storage bucket permissions

**Certificate upload fails:**
- Check file format (PDF or image only)
- Verify file size (under 10MB)
- Ensure you're logged in as an organization
- Check network connection

**Verification status not updating:**
- Allow 1-2 business days for processing
- Contact admin if status remains pending after 3 days
- Ensure uploaded certificate is clear and readable

## Support

For issues or questions:
- Check error messages in browser console
- Verify Supabase storage bucket configuration
- Review RLS policies in Supabase dashboard
- Contact technical support team
