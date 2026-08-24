-- ====================================================
-- Create 'system-assets' storage bucket for system logos/images
-- ====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'system-assets',
  'system-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon']
)
ON CONFLICT (id) DO NOTHING;

-- Drop if exists then recreate (avoids duplicate policy errors)
DROP POLICY IF EXISTS "system_assets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "system_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "system_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "system_assets_delete" ON storage.objects;

-- Allow public read access
CREATE POLICY "system_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'system-assets');

-- Allow all insert
CREATE POLICY "system_assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'system-assets');

-- Allow all update
CREATE POLICY "system_assets_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'system-assets');

-- Allow all delete
CREATE POLICY "system_assets_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'system-assets');
