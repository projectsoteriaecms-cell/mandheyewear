-- Update brand and metadata on all 3 LA MARTINA MAV718 products
UPDATE products SET brand = 'LA MARTINA', material = 'Metal/Acetate', style = 'Clubmaster', color = 'COL.10' WHERE id = '87adcada-627d-4694-ac2c-7507a71013cb';
UPDATE products SET brand = 'LA MARTINA', material = 'Metal/Acetate', style = 'Clubmaster', color = 'COL.12' WHERE id = 'b7458b24-ec4d-4e84-baf8-3413a5573b02';
UPDATE products SET brand = 'LA MARTINA', material = 'Metal/Acetate', style = 'Clubmaster' WHERE id = '3763e49b-bd87-4f69-a808-e98d01a799c4';

-- Insert COL.01 variant
INSERT INTO products (sku, name, brand, brand_line, price, item_type, material, style, color, gender, frame_width, bridge_size, temple_length, description, is_active)
VALUES (
  'LA-MARTINA-MAV718-COL01',
  'La Martina Frame MAV718 51 20 145 COL.01',
  'LA MARTINA',
  'm_and_h_fashion',
  165000,
  'frames',
  'Metal/Acetate',
  'Clubmaster',
  'Black/Gold with Red Accents',
  'unisex',
  '51',
  '20',
  '145',
  'La Martina MAV718 clubmaster-style frame. Black acetate brow bar with gold metal lower rim. Red accent detailing on temple tips. Handmade. Lens width: 51mm, Bridge: 20mm, Temple: 145mm.',
  true
);

-- Add frame attributes for new product
INSERT INTO frame_attributes (product_id, model_code, frame_shape, frame_material, lens_width, bridge_size, temple_length, front_color, temple_color)
SELECT id, 'MAV718', 'clubmaster', 'metal/acetate', 51, 20, 145, 'Black/Gold', 'Black with Red Accents'
FROM products WHERE sku = 'LA-MARTINA-MAV718-COL01';