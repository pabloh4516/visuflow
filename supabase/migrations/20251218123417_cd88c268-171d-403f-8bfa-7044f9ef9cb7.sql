-- Create screenshots storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload screenshots
CREATE POLICY "Authenticated users can upload screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'screenshots');

-- Allow public access to read screenshots
CREATE POLICY "Public can view screenshots"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'screenshots');

-- Allow service role to upload (for edge functions)
CREATE POLICY "Service role can upload screenshots"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'screenshots');

-- Allow service role to delete screenshots
CREATE POLICY "Service role can delete screenshots"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'screenshots');