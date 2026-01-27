-- Create bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow authenticated admin users to upload
CREATE POLICY "Admin users can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow public read access
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Allow admin users to delete images
CREATE POLICY "Admin users can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- Allow admin users to update images
CREATE POLICY "Admin users can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');