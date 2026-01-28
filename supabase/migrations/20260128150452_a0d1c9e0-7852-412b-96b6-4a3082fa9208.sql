-- Update product-images bucket to allow 7MB files
UPDATE storage.buckets 
SET file_size_limit = 7340032  -- 7MB in bytes (7 * 1024 * 1024)
WHERE id = 'product-images';