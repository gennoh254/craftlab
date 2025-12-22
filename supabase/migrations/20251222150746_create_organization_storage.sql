/*
  # Create Storage Buckets for Organizations

  1. Buckets
    - company-logos (public read access)
    - registration-certificates (private access, organization-only)

  2. Security Policies
    - Organizations can upload their own files
    - Logos are publicly readable
    - Certificates are only readable by the organization that owns them
*/

-- Create company-logos bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create registration-certificates bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-certificates', 'registration-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company-logos bucket

-- Allow authenticated users to upload their own company logo
CREATE POLICY "Organizations can upload own company logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to company logos
CREATE POLICY "Public read access to company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Allow organizations to update their own logo
CREATE POLICY "Organizations can update own company logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow organizations to delete their own logo
CREATE POLICY "Organizations can delete own company logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for registration-certificates bucket

-- Allow authenticated users to upload their own registration certificate
CREATE POLICY "Organizations can upload own registration certificate"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'registration-certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow organizations to read their own certificate
CREATE POLICY "Organizations can read own registration certificate"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'registration-certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow organizations to update their own certificate
CREATE POLICY "Organizations can update own registration certificate"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'registration-certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow organizations to delete their own certificate
CREATE POLICY "Organizations can delete own registration certificate"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'registration-certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);