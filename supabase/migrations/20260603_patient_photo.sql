-- Add photo_url column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;

-- Create storage bucket for patient photos (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-photos',
  'patient-photos',
  false,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: psychologist can upload/read/delete only their own patients' photos
-- Path convention: {psychologist_id}/{patient_id}/{filename}

CREATE POLICY "Psychologist can upload patient photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Psychologist can read patient photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Psychologist can delete patient photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Psychologist can update patient photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'patient-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
