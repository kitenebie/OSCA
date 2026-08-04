-- Storage policies for seniors buckets (seniors-1, seniors-2, seniors-3)
-- Run this in SQL Editor after creating the buckets

-- Allow public read access (photos are displayed publicly)
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('seniors-1', 'seniors-2', 'seniors-3'));

-- Allow authenticated and anon uploads (since app uses anon key)
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('seniors-1', 'seniors-2', 'seniors-3'));

-- Allow updates (upsert)
CREATE POLICY "Allow updates" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('seniors-1', 'seniors-2', 'seniors-3'));

-- Allow deletes
CREATE POLICY "Allow deletes" ON storage.objects
  FOR DELETE USING (bucket_id IN ('seniors-1', 'seniors-2', 'seniors-3'));
