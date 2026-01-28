-- Fix storage policy for product image uploads
-- The INSERT policy needs a proper WITH CHECK clause

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Admin users can upload product images" ON storage.objects;

-- Create a proper insert policy with WITH CHECK
CREATE POLICY "Admin users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Also ensure the bucket has proper configuration
UPDATE storage.buckets 
SET file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'product-images';