-- M&H Frame Descriptions Seed
-- Generated from frame_descriptions.json (67 frames)
-- Paste this into Lovable to populate products + frame_attributes
-- Run AFTER applying: 20260525120000_mh_frame_spec_enhancements.sql

-- MH-471: Cartier C34C38MJ
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-471', 'Cartier C34C38MJ', 'Cartier', 'm_and_h_fashion',
     'frames', 1900000, 'Precision in titanium. Cartier at its clearest.',
     'The C34C38MJ is Cartier''s answer to invisible precision — a metal rimless construction that carries the face without competing with it. The 60mm lens width and 14mm bridge sit close to the face, reducing the visual weight that heavier frames carry. Built for the wearer who values presence without performance — at home in both a client meeting and a quiet evening.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Oversized 60mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• Rimless construction adds nothing to the face — and that restraint is the point',
     NULL, 'Metal', 'Oval',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Cartier C34C38MJ',
    tagline     = 'Precision in titanium. Cartier at its clearest.',
    description = 'The C34C38MJ is Cartier''s answer to invisible precision — a metal rimless construction that carries the face without competing with it. The 60mm lens width and 14mm bridge sit close to the face, reducing the visual weight that heavier frames carry. Built for the wearer who values presence without performance — at home in both a client meeting and a quiet evening.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Oversized 60mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• Rimless construction adds nothing to the face — and that restraint is the point',
    color       = NULL,
    material    = 'Metal',
    style       = 'Oval',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'C34C38MJ', 'Oval', 'Metal', NULL,
     60, 14, 140,
     46, 138,
     58, 76, -8.00, +6.00,
     true, 'Extra Large', 'All face shapes', 'Work / Client meetings / Fine dining')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'C34C38MJ',
    frame_shape  = 'Oval',
    frame_material = 'Metal',
    lens_width   = 60,
    bridge_size  = 14,
    temple_length = 140,
    lens_height  = 46,
    total_width  = 138,
    pd_range_min = 58, pd_range_max = 76,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Extra Large',
    best_for_faces     = 'All face shapes',
    best_for_occasions = 'Work / Client meetings / Fine dining';
END $$;

-- MH-474: Cartier CT03490 001
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-474', 'Cartier CT03490 001', 'Cartier', 'm_and_h_fashion',
     'frames', 1550000, 'Clean geometry. Quiet authority. Cartier.',
     'A rectangular optical frame in titanium, the CT03490 001 brings Cartier''s signature proportional exactness to everyday wear. The 55mm lens width and 18mm bridge sit close to the face, reducing the visual weight that heavier frames carry. Built for the wearer who values presence without performance — at home in both a client meeting and a quiet evening.
• Full titanium frame — ultra-light at under 20g with exceptional corrosion resistance
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
     'Titanium', 'Titanium', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Cartier CT03490 001',
    tagline     = 'Clean geometry. Quiet authority. Cartier.',
    description = 'A rectangular optical frame in titanium, the CT03490 001 brings Cartier''s signature proportional exactness to everyday wear. The 55mm lens width and 18mm bridge sit close to the face, reducing the visual weight that heavier frames carry. Built for the wearer who values presence without performance — at home in both a client meeting and a quiet evening.
• Full titanium frame — ultra-light at under 20g with exceptional corrosion resistance
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
    color       = 'Titanium',
    material    = 'Titanium',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'CT03490 001', 'Rectangular', 'Titanium', 'Titanium',
     55, 18, 145,
     38, 132,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Client meetings / Fine dining')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'CT03490 001',
    frame_shape  = 'Rectangular',
    frame_material = 'Titanium',
    lens_width   = 55,
    bridge_size  = 18,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 132,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Client meetings / Fine dining';
END $$;

-- MH-470: Dunhill DU00380A 003 TITANIUM
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-470', 'Dunhill DU00380A 003 TITANIUM', 'Dunhill', 'm_and_h_fashion',
     'frames', 900000, 'Dunhill titanium — built to outlast the occasion.',
     'The DU00380A 003 TITANIUM is Dunhill''s take on the rectangular optical frame — titanium construction, clean geometry, zero compromise. At 55mm wide with a 16mm bridge, the proportions sit confidently on any face width. Built for the kind of person who expects their accessories to outlast the occasion and the suit.
• Full titanium frame — ultra-light at under 20g with exceptional corrosion resistance
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
     'Titanium', 'Titanium', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Dunhill DU00380A 003 TITANIUM',
    tagline     = 'Dunhill titanium — built to outlast the occasion.',
    description = 'The DU00380A 003 TITANIUM is Dunhill''s take on the rectangular optical frame — titanium construction, clean geometry, zero compromise. At 55mm wide with a 16mm bridge, the proportions sit confidently on any face width. Built for the kind of person who expects their accessories to outlast the occasion and the suit.
• Full titanium frame — ultra-light at under 20g with exceptional corrosion resistance
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
    color       = 'Titanium',
    material    = 'Titanium',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DU00380A 003 TITANIUM', 'Rectangular', 'Titanium', 'Titanium',
     55, 16, 145,
     38, 130,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Client meetings / Fine dining')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DU00380A 003 TITANIUM',
    frame_shape  = 'Rectangular',
    frame_material = 'Titanium',
    lens_width   = 55,
    bridge_size  = 16,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 130,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Client meetings / Fine dining';
END $$;

-- MH-1720: Clary Gray DAKARIAN CNG14 24K
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1720', 'Clary Gray DAKARIAN CNG14 24K', 'Clary Gray', 'm_and_h_fashion',
     'frames', 850000, 'Clary Gray gold: a frame that earns its finish.',
     'The DAKARIAN CNG14 24K in 24-karat gold finish is Clary Gray''s statement on what a rectangular frame can carry. At 58mm wide, the proportions are generous without becoming theatrical — this is statement through quality, not volume. Made for the wearer who understands what real gold weight feels like on the face.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Wider 58mm lens profile flatters oval and oblong faces; the generous size gives the prescription more working area — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
     'Gray', 'Metal', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Clary Gray DAKARIAN CNG14 24K',
    tagline     = 'Clary Gray gold: a frame that earns its finish.',
    description = 'The DAKARIAN CNG14 24K in 24-karat gold finish is Clary Gray''s statement on what a rectangular frame can carry. At 58mm wide, the proportions are generous without becoming theatrical — this is statement through quality, not volume. Made for the wearer who understands what real gold weight feels like on the face.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Wider 58mm lens profile flatters oval and oblong faces; the generous size gives the prescription more working area — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
    color       = 'Gray',
    material    = 'Metal',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DAKARIAN CNG14 24K', 'Rectangular', 'Metal', 'Gray',
     58, 17, 145,
     40, 137,
     58, 76, -8.00, +6.00,
     true, 'Large', 'Oval, Round, Heart', 'Work / Client meetings / Fine dining')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DAKARIAN CNG14 24K',
    frame_shape  = 'Rectangular',
    frame_material = 'Metal',
    lens_width   = 58,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 40,
    total_width  = 137,
    pd_range_min = 58, pd_range_max = 76,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Large',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Client meetings / Fine dining';
END $$;

-- MH-1703: Gucci GG1438O 003
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1703', 'Gucci GG1438O 003', 'Gucci', 'm_and_h_fashion',
     'frames', 780000, 'Compact Gucci square — confident, not loud.',
     'The GG1438O 003 takes Gucci''s design vocabulary — considered proportions, metal construction — and translates it into a frame suited to long, demanding days. At 53mm wide with a 20mm bridge, it balances the face without overpowering it. The result is a frame that carries its label lightly, letting the wearer do the talking.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Compact square silhouette projects quiet authority in professional settings',
     NULL, 'Metal', 'Square',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Gucci GG1438O 003',
    tagline     = 'Compact Gucci square — confident, not loud.',
    description = 'The GG1438O 003 takes Gucci''s design vocabulary — considered proportions, metal construction — and translates it into a frame suited to long, demanding days. At 53mm wide with a 20mm bridge, it balances the face without overpowering it. The result is a frame that carries its label lightly, letting the wearer do the talking.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Compact square silhouette projects quiet authority in professional settings',
    color       = NULL,
    material    = 'Metal',
    style       = 'Square',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'GG1438O 003', 'Square', 'Metal', NULL,
     53, 20, 145,
     40, 130,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Client meetings / Fine dining')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'GG1438O 003',
    frame_shape  = 'Square',
    frame_material = 'Metal',
    lens_width   = 53,
    bridge_size  = 20,
    temple_length = 145,
    lens_height  = 40,
    total_width  = 130,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Client meetings / Fine dining';
END $$;

-- MH-1739: Jimmy Choo JC 3004B 5013
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1739', 'Jimmy Choo JC 3004B 5013', 'Jimmy Choo', 'm_and_h_fashion',
     'frames', 540000, 'Jimmy Choo: dressed-up without trying too hard.',
     'The JC 3004B 5013 brings Jimmy Choo''s tailored aesthetic into a rectangular optical frame designed for the modern professional. The acetate construction keeps it light at 54mm wide, comfortable enough for a full day''s wear. Equally at home in a boardroom as at a dinner table.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Jimmy Choo JC 3004B 5013',
    tagline     = 'Jimmy Choo: dressed-up without trying too hard.',
    description = 'The JC 3004B 5013 brings Jimmy Choo''s tailored aesthetic into a rectangular optical frame designed for the modern professional. The acetate construction keeps it light at 54mm wide, comfortable enough for a full day''s wear. Equally at home in a boardroom as at a dinner table.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'JC 3004B 5013', 'Rectangular', 'Acetate', NULL,
     54, 16, 140,
     38, 128,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Client meetings / Fine dining')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'JC 3004B 5013',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 16,
    temple_length = 140,
    lens_height  = 38,
    total_width  = 128,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Client meetings / Fine dining';
END $$;

-- MH-323: Dolce & Gabbana DG3376-B 502
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-323', 'Dolce & Gabbana DG3376-B 502', 'Dolce & Gabbana', 'm_and_h_fashion',
     'frames', 521000, 'Italian craft in every degree of this frame.',
     'The DG3376-B 502 is a rectangular acetate frame that runs Italian craft through a modern daily-wear silhouette. The 53mm lens and 18mm bridge combination makes it versatile across face geometries. Dress it up or wear it through a full working week — it holds its line either way.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Dolce & Gabbana DG3376-B 502',
    tagline     = 'Italian craft in every degree of this frame.',
    description = 'The DG3376-B 502 is a rectangular acetate frame that runs Italian craft through a modern daily-wear silhouette. The 53mm lens and 18mm bridge combination makes it versatile across face geometries. Dress it up or wear it through a full working week — it holds its line either way.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DG3376-B 502', 'Rectangular', 'Acetate', NULL,
     53, 18, 140,
     36, 128,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Creative settings / Going out')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DG3376-B 502',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 18,
    temple_length = 140,
    lens_height  = 36,
    total_width  = 128,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Creative settings / Going out';
END $$;

-- MH-1510: Hugo HG1257 1ED
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1510', 'Hugo HG1257 1ED', 'Hugo', 'm_and_h_fashion',
     'frames', 411000, 'Hugo keeps it sharp. Nothing extra.',
     'Hugo''s HG1257 1ED is a rectangular optical frame designed to keep up with the pace of professional life. The metal construction and 54mm lens width strike the right balance between presence and everyday wearability. Clean, purposeful, and suited to both a boardroom and a bar.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
     NULL, 'Metal', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Hugo HG1257 1ED',
    tagline     = 'Hugo keeps it sharp. Nothing extra.',
    description = 'Hugo''s HG1257 1ED is a rectangular optical frame designed to keep up with the pace of professional life. The metal construction and 54mm lens width strike the right balance between presence and everyday wearability. Clean, purposeful, and suited to both a boardroom and a bar.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
    color       = NULL,
    material    = 'Metal',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'HG1257 1ED', 'Rectangular', 'Metal', NULL,
     54, 18, 140,
     38, 130,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Creative settings / Going out')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'HG1257 1ED',
    frame_shape  = 'Rectangular',
    frame_material = 'Metal',
    lens_width   = 54,
    bridge_size  = 18,
    temple_length = 140,
    lens_height  = 38,
    total_width  = 130,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Creative settings / Going out';
END $$;

-- MH-504: Dario Martini DM 822 COL.1
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-504', 'Dario Martini DM 822 COL.1', 'Dario Martini', 'm_and_h_fashion',
     'frames', 400000, 'Dario Martini. Italian line work, everyday weight.',
     'The DM 822 COL.1 is Dario Martini''s rectangular frame — Italian optical craft at an accessible price point. The acetate build and 55mm lens width give it enough heft to read as intentional without being heavy. A frame that works through a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
     'Gold', 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Dario Martini DM 822 COL.1',
    tagline     = 'Dario Martini. Italian line work, everyday weight.',
    description = 'The DM 822 COL.1 is Dario Martini''s rectangular frame — Italian optical craft at an accessible price point. The acetate build and 55mm lens width give it enough heft to read as intentional without being heavy. A frame that works through a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
    color       = 'Gold',
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DM 822 COL.1', 'Rectangular', 'Acetate', 'Gold',
     55, 18, 135,
     38, 132,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Creative settings / Going out')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DM 822 COL.1',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 55,
    bridge_size  = 18,
    temple_length = 135,
    lens_height  = 38,
    total_width  = 132,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Creative settings / Going out';
END $$;

-- MH-1512: Tommy Hilfiger TH2072 KB7
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1512', 'Tommy Hilfiger TH2072 KB7', 'Tommy Hilfiger', 'm_and_h_fashion',
     'frames', 390000, 'Tommy''s go-to: polished, versatile, consistent.',
     'The TH2072 KB7 is Tommy Hilfiger''s everyday rectangular — polished enough for the office, relaxed enough for the weekend. The acetate frame sits at 53mm wide with a 19mm bridge, fitting a wide range of faces without adjustment. A reliable all-rounder that earns its place in any collection.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Tommy Hilfiger TH2072 KB7',
    tagline     = 'Tommy''s go-to: polished, versatile, consistent.',
    description = 'The TH2072 KB7 is Tommy Hilfiger''s everyday rectangular — polished enough for the office, relaxed enough for the weekend. The acetate frame sits at 53mm wide with a 19mm bridge, fitting a wide range of faces without adjustment. A reliable all-rounder that earns its place in any collection.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'TH2072 KB7', 'Rectangular', 'Acetate', NULL,
     53, 19, 150,
     36, 129,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'TH2072 KB7',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 19,
    temple_length = 150,
    lens_height  = 36,
    total_width  = 129,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-111: Dolce & Gabbana DG5101 501
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-111', 'Dolce & Gabbana DG5101 501', 'Dolce & Gabbana', 'm_and_h_fashion',
     'frames', 375000, 'Italian craft in every degree of this frame.',
     'The DG5101 501 is a rectangular acetate frame that runs Italian craft through a modern daily-wear silhouette. The 52mm lens and 18mm bridge combination makes it versatile across face geometries. Dress it up or wear it through a full working week — it holds its line either way.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
     'Black', 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Dolce & Gabbana DG5101 501',
    tagline     = 'Italian craft in every degree of this frame.',
    description = 'The DG5101 501 is a rectangular acetate frame that runs Italian craft through a modern daily-wear silhouette. The 52mm lens and 18mm bridge combination makes it versatile across face geometries. Dress it up or wear it through a full working week — it holds its line either way.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
    color       = 'Black',
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DG5101 501', 'Rectangular', 'Acetate', 'Black',
     52, 18, 145,
     36, 126,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Creative settings / Going out')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DG5101 501',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 52,
    bridge_size  = 18,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 126,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Creative settings / Going out';
END $$;

-- MH-1444: Tommy Hilfiger TH2049 003
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1444', 'Tommy Hilfiger TH2049 003', 'Tommy Hilfiger', 'm_and_h_fashion',
     'frames', 375000, 'Tommy''s go-to: polished, versatile, consistent.',
     'The TH2049 003 is Tommy Hilfiger''s everyday rectangular — polished enough for the office, relaxed enough for the weekend. The acetate frame sits at 53mm wide with a 18mm bridge, fitting a wide range of faces without adjustment. A reliable all-rounder that earns its place in any collection.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Tommy Hilfiger TH2049 003',
    tagline     = 'Tommy''s go-to: polished, versatile, consistent.',
    description = 'The TH2049 003 is Tommy Hilfiger''s everyday rectangular — polished enough for the office, relaxed enough for the weekend. The acetate frame sits at 53mm wide with a 18mm bridge, fitting a wide range of faces without adjustment. A reliable all-rounder that earns its place in any collection.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'TH2049 003', 'Rectangular', 'Acetate', NULL,
     53, 18, 145,
     36, 128,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'TH2049 003',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 18,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 128,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1446: Tommy Hilfiger TH1962 000
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1446', 'Tommy Hilfiger TH1962 000', 'Tommy Hilfiger', 'm_and_h_fashion',
     'frames', 375000, 'Tommy''s go-to: polished, versatile, consistent.',
     'The TH1962 000 is Tommy Hilfiger''s everyday rectangular — polished enough for the office, relaxed enough for the weekend. The acetate frame sits at 55mm wide with a 16mm bridge, fitting a wide range of faces without adjustment. A reliable all-rounder that earns its place in any collection.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Tommy Hilfiger TH1962 000',
    tagline     = 'Tommy''s go-to: polished, versatile, consistent.',
    description = 'The TH1962 000 is Tommy Hilfiger''s everyday rectangular — polished enough for the office, relaxed enough for the weekend. The acetate frame sits at 55mm wide with a 16mm bridge, fitting a wide range of faces without adjustment. A reliable all-rounder that earns its place in any collection.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'TH1962 000', 'Rectangular', 'Acetate', NULL,
     55, 16, 140,
     38, 130,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'TH1962 000',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 55,
    bridge_size  = 16,
    temple_length = 140,
    lens_height  = 38,
    total_width  = 130,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-107: Ray-Ban RB3025 9202/31
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-107', 'Ray-Ban RB3025 9202/31', 'Ray-Ban', 'm_and_h_fashion',
     'frames', 335000, 'The aviator that defined the category.',
     'The RB3025 9202/31 is the Ray-Ban aviator — the frame that hasn''t needed updating because it got it right. A 62mm teardrop lens in metal sits on a flat bridge, giving the face a long, open look. Worn by pilots, worn by icons, and reliably right for both the weekend and the working week.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Oversized 62mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• Sun protection built into a frame with enough character to stand alone as a style statement',
     'Gold', 'Metal', 'Aviator',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Ray-Ban RB3025 9202/31',
    tagline     = 'The aviator that defined the category.',
    description = 'The RB3025 9202/31 is the Ray-Ban aviator — the frame that hasn''t needed updating because it got it right. A 62mm teardrop lens in metal sits on a flat bridge, giving the face a long, open look. Worn by pilots, worn by icons, and reliably right for both the weekend and the working week.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Oversized 62mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• Sun protection built into a frame with enough character to stand alone as a style statement',
    color       = 'Gold',
    material    = 'Metal',
    style       = 'Aviator',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'RB3025 9202/31', 'Aviator', 'Metal', 'Gold',
     62, 14, 140,
     54, 142,
     58, 76, -8.00, +6.00,
     true, 'Extra Large', 'Oval, Square, Diamond', 'Leisure / Travel / Casual dressing')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'RB3025 9202/31',
    frame_shape  = 'Aviator',
    frame_material = 'Metal',
    lens_width   = 62,
    bridge_size  = 14,
    temple_length = 140,
    lens_height  = 54,
    total_width  = 142,
    pd_range_min = 58, pd_range_max = 76,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Extra Large',
    best_for_faces     = 'Oval, Square, Diamond',
    best_for_occasions = 'Leisure / Travel / Casual dressing';
END $$;

-- MH-1443: Pierre Cardin P.C.8875 J5G
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1443', 'Pierre Cardin P.C.8875 J5G', 'Pierre Cardin', 'm_and_h_fashion',
     'frames', 330000, 'Pierre Cardin''s classic fit, revisited.',
     'The P.C.8875 J5G brings Pierre Cardin''s classic European shaping to a full-rim rectangular frame built for everyday use. At 52mm wide with acetate construction, it carries its proportions confidently without being showy. French design sense at a price that makes daily wear sensible.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Pierre Cardin P.C.8875 J5G',
    tagline     = 'Pierre Cardin''s classic fit, revisited.',
    description = 'The P.C.8875 J5G brings Pierre Cardin''s classic European shaping to a full-rim rectangular frame built for everyday use. At 52mm wide with acetate construction, it carries its proportions confidently without being showy. French design sense at a price that makes daily wear sensible.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'P.C.8875 J5G', 'Rectangular', 'Acetate', NULL,
     52, 19, 140,
     36, 127,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'P.C.8875 J5G',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 52,
    bridge_size  = 19,
    temple_length = 140,
    lens_height  = 36,
    total_width  = 127,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-9: Oakley OX8156-0256
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-9', 'Oakley OX8156-0256', 'Oakley', 'm_and_h_fashion',
     'frames', 240000, 'A rectangular frame designed for daily confidence.',
     'The Oakley OX8156-0256 is a rectangular frame built with the precision the brand''s design reputation demands. At 56mm wide in metal, it commands attention without overplaying its hand. A frame for the wearer who dresses intentionally.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
     'Matte Brown Tortoise', 'Metal', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Oakley OX8156-0256',
    tagline     = 'A rectangular frame designed for daily confidence.',
    description = 'The Oakley OX8156-0256 is a rectangular frame built with the precision the brand''s design reputation demands. At 56mm wide in metal, it commands attention without overplaying its hand. A frame for the wearer who dresses intentionally.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
    color       = 'Matte Brown Tortoise',
    material    = 'Metal',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'OX8156-0256', 'Rectangular', 'Metal', 'Matte Brown Tortoise',
     56, 18, 137,
     38, 134,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Creative settings / Going out')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'OX8156-0256',
    frame_shape  = 'Rectangular',
    frame_material = 'Metal',
    lens_width   = 56,
    bridge_size  = 18,
    temple_length = 137,
    lens_height  = 38,
    total_width  = 134,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Creative settings / Going out';
END $$;

-- MH-51: Vogue VO 4298-T 5191
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-51', 'Vogue VO 4298-T 5191', 'Vogue', 'm_and_h_fashion',
     'frames', 225000, 'A Vogue cat-eye that holds the throwback right.',
     'The Vogue VO 4298-T 5191 pulls from ''70s cat-eye geometry and grounds it in a wearable 53mm width. The acetate construction keeps it light enough to wear through a full day without fatigue. A throwback silhouette that reads current rather than nostalgic.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• The ''70s cat-eye silhouette updated for current wardrobes — pairs with both casual and work dressing',
     NULL, 'Acetate', 'Cat-Eye',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Vogue VO 4298-T 5191',
    tagline     = 'A Vogue cat-eye that holds the throwback right.',
    description = 'The Vogue VO 4298-T 5191 pulls from ''70s cat-eye geometry and grounds it in a wearable 53mm width. The acetate construction keeps it light enough to wear through a full day without fatigue. A throwback silhouette that reads current rather than nostalgic.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• The ''70s cat-eye silhouette updated for current wardrobes — pairs with both casual and work dressing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Cat-Eye',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'VO 4298-T 5191', 'Cat-Eye', 'Acetate', NULL,
     53, 18, 140,
     34, 128,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Square, Diamond', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'VO 4298-T 5191',
    frame_shape  = 'Cat-Eye',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 18,
    temple_length = 140,
    lens_height  = 34,
    total_width  = 128,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Square, Diamond',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-507: Dario Martini DM716 COL.2
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-507', 'Dario Martini DM716 COL.2', 'Dario Martini', 'm_and_h_fashion',
     'frames', 190000, 'Dario Martini. Italian line work, everyday weight.',
     'The DM716 COL.2 is Dario Martini''s rectangular frame — Italian optical craft at an accessible price point. The acetate build and 50mm lens width give it enough heft to read as intentional without being heavy. A frame that works through a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 50mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Dario Martini DM716 COL.2',
    tagline     = 'Dario Martini. Italian line work, everyday weight.',
    description = 'The DM716 COL.2 is Dario Martini''s rectangular frame — Italian optical craft at an accessible price point. The acetate build and 50mm lens width give it enough heft to read as intentional without being heavy. A frame that works through a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 50mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Bold rectangular frame that carries the brand''s fashion confidence into daily wear',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DM716 COL.2', 'Rectangular', 'Acetate', NULL,
     50, 19, 135,
     34, 123,
     54, 68, -8.00, +6.00,
     true, 'Narrow', 'Oval, Round, Heart', 'Work / Creative settings / Going out')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DM716 COL.2',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 50,
    bridge_size  = 19,
    temple_length = 135,
    lens_height  = 34,
    total_width  = 123,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Narrow',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Creative settings / Going out';
END $$;

-- MH-212: Seventh Street 7A 081 6LB
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-212', 'Seventh Street 7A 081 6LB', 'Seventh Street', 'm_and_h_fashion',
     'frames', 170000, 'A rectangular frame designed for daily confidence.',
     'The Seventh Street 7A 081 6LB is a rectangular frame designed for consistent, all-day prescription wear. At 57mm wide in metal with a 18mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Wider 57mm lens profile flatters oval and oblong faces; the generous size gives the prescription more working area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Metal', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Seventh Street 7A 081 6LB',
    tagline     = 'A rectangular frame designed for daily confidence.',
    description = 'The Seventh Street 7A 081 6LB is a rectangular frame designed for consistent, all-day prescription wear. At 57mm wide in metal with a 18mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Wider 57mm lens profile flatters oval and oblong faces; the generous size gives the prescription more working area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Metal',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, '7A 081 6LB', 'Rectangular', 'Metal', NULL,
     57, 18, 145,
     40, 136,
     58, 76, -8.00, +6.00,
     true, 'Large', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = '7A 081 6LB',
    frame_shape  = 'Rectangular',
    frame_material = 'Metal',
    lens_width   = 57,
    bridge_size  = 18,
    temple_length = 145,
    lens_height  = 40,
    total_width  = 136,
    pd_range_min = 58, pd_range_max = 76,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Large',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1503: Polaroid PLD D373 PJP
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1503', 'Polaroid PLD D373 PJP', 'Polaroid', 'm_and_h_fashion',
     'frames', 155000, 'Polaroid keeps it simple and gets it right.',
     'The Polaroid PLD D373 PJP is a rectangular frame designed for straightforward, all-day prescription wear. At 54mm wide in acetate, the fit is consistent and the weight stays easy throughout the day. Practical, dependable, and priced for daily use.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Polaroid PLD D373 PJP',
    tagline     = 'Polaroid keeps it simple and gets it right.',
    description = 'The Polaroid PLD D373 PJP is a rectangular frame designed for straightforward, all-day prescription wear. At 54mm wide in acetate, the fit is consistent and the weight stays easy throughout the day. Practical, dependable, and priced for daily use.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'PLD D373 PJP', 'Rectangular', 'Acetate', NULL,
     54, 17, 140,
     38, 129,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'PLD D373 PJP',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 17,
    temple_length = 140,
    lens_height  = 38,
    total_width  = 129,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-448: La Martina MAV749 COL.16
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-448', 'La Martina MAV749 COL.16', 'La Martina', 'm_and_h_fashion',
     'frames', 150000, 'La Martina: field-bred, boardroom-ready.',
     'The MAV749 COL.16 draws on La Martina''s polo heritage — a rectangular frame built for the active professional. At 53mm wide in acetate, the proportions are clean without being austere. Moves between the field and the boardroom without adjustment.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'La Martina MAV749 COL.16',
    tagline     = 'La Martina: field-bred, boardroom-ready.',
    description = 'The MAV749 COL.16 draws on La Martina''s polo heritage — a rectangular frame built for the active professional. At 53mm wide in acetate, the proportions are clean without being austere. Moves between the field and the boardroom without adjustment.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'MAV749 COL.16', 'Rectangular', 'Acetate', NULL,
     53, 20, 145,
     36, 130,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'MAV749 COL.16',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 20,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 130,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-449: La Martina MAV720 COL.12
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-449', 'La Martina MAV720 COL.12', 'La Martina', 'm_and_h_fashion',
     'frames', 150000, 'La Martina: field-bred, boardroom-ready.',
     'The MAV720 COL.12 draws on La Martina''s polo heritage — a rectangular frame built for the active professional. At 52mm wide in acetate, the proportions are clean without being austere. Moves between the field and the boardroom without adjustment.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'La Martina MAV720 COL.12',
    tagline     = 'La Martina: field-bred, boardroom-ready.',
    description = 'The MAV720 COL.12 draws on La Martina''s polo heritage — a rectangular frame built for the active professional. At 52mm wide in acetate, the proportions are clean without being austere. Moves between the field and the boardroom without adjustment.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'MAV720 COL.12', 'Rectangular', 'Acetate', NULL,
     52, 17, 145,
     36, 125,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'MAV720 COL.12',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 52,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 125,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-506: Dario Martini DM 796 COL.2
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-506', 'Dario Martini DM 796 COL.2', 'Dario Martini', 'm_and_h_fashion',
     'frames', 150000, 'A cat-eye for the person who chooses deliberately.',
     'The Dario Martini DM 796 COL.2 is an Italian cat-eye built for the wearer who knows that detail is the point. At 54mm wide with upswept corners, it lifts the face subtly without announcing itself. Pairs well with sharp dressing and confident personal style.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• An upswept corner that lifts the eyes — flattering, distinctive, deliberately chosen',
     'Black Cat-Eye Swarovski', 'Acetate', 'Cat-Eye',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Dario Martini DM 796 COL.2',
    tagline     = 'A cat-eye for the person who chooses deliberately.',
    description = 'The Dario Martini DM 796 COL.2 is an Italian cat-eye built for the wearer who knows that detail is the point. At 54mm wide with upswept corners, it lifts the face subtly without announcing itself. Pairs well with sharp dressing and confident personal style.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• An upswept corner that lifts the eyes — flattering, distinctive, deliberately chosen',
    color       = 'Black Cat-Eye Swarovski',
    material    = 'Acetate',
    style       = 'Cat-Eye',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DM 796 COL.2', 'Cat-Eye', 'Acetate', 'Black Cat-Eye Swarovski',
     54, 19, 140,
     36, 131,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Square, Diamond', 'Work / Creative settings / Going out')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DM 796 COL.2',
    frame_shape  = 'Cat-Eye',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 19,
    temple_length = 140,
    lens_height  = 36,
    total_width  = 131,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Square, Diamond',
    best_for_occasions = 'Work / Creative settings / Going out';
END $$;

-- MH-131: Polaroid PLD D490/G J5G
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-131', 'Polaroid PLD D490/G J5G', 'Polaroid', 'm_and_h_fashion',
     'frames', 140000, 'Polaroid keeps it simple and gets it right.',
     'The Polaroid PLD D490/G J5G is a rectangular frame designed for straightforward, all-day prescription wear. At 52mm wide in acetate, the fit is consistent and the weight stays easy throughout the day. Practical, dependable, and priced for daily use.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Polaroid PLD D490/G J5G',
    tagline     = 'Polaroid keeps it simple and gets it right.',
    description = 'The Polaroid PLD D490/G J5G is a rectangular frame designed for straightforward, all-day prescription wear. At 52mm wide in acetate, the fit is consistent and the weight stays easy throughout the day. Practical, dependable, and priced for daily use.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'PLD D490/G J5G', 'Rectangular', 'Acetate', NULL,
     52, 18, 145,
     36, 126,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'PLD D490/G J5G',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 52,
    bridge_size  = 18,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 126,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1779: Cartier CT0563S C2
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1779', 'Cartier CT0563S C2', 'Cartier', 'm_and_h_fashion',
     'frames', 130000, 'A Cartier square that commands the room.',
     'A square optical frame in metal, the CT0563S C2 brings Cartier''s signature proportional exactness to everyday wear. The 56mm lens width and 18mm bridge sit close to the face, reducing the visual weight that heavier frames carry. Built for the wearer who values presence without performance — at home in both a client meeting and a quiet evening.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Compact square silhouette projects quiet authority in professional settings',
     NULL, 'Metal', 'Square',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Cartier CT0563S C2',
    tagline     = 'A Cartier square that commands the room.',
    description = 'A square optical frame in metal, the CT0563S C2 brings Cartier''s signature proportional exactness to everyday wear. The 56mm lens width and 18mm bridge sit close to the face, reducing the visual weight that heavier frames carry. Built for the wearer who values presence without performance — at home in both a client meeting and a quiet evening.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Compact square silhouette projects quiet authority in professional settings',
    color       = NULL,
    material    = 'Metal',
    style       = 'Square',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'CT0563S C2', 'Square', 'Metal', NULL,
     56, 18, 145,
     42, 134,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Client meetings / Fine dining')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'CT0563S C2',
    frame_shape  = 'Square',
    frame_material = 'Metal',
    lens_width   = 56,
    bridge_size  = 18,
    temple_length = 145,
    lens_height  = 42,
    total_width  = 134,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Client meetings / Fine dining';
END $$;

-- MH-1780: Cartier 30104 C9
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1780', 'Cartier 30104 C9', 'Cartier', 'm_and_h_fashion',
     'frames', 130000, 'Clean geometry. Quiet authority. Cartier.',
     'A rectangular optical frame in metal, the 30104 C9 brings Cartier''s signature proportional exactness to everyday wear. The 54mm lens width and 15mm bridge sit close to the face, reducing the visual weight that heavier frames carry. Built for the wearer who values presence without performance — at home in both a client meeting and a quiet evening.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
     NULL, 'Metal', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Cartier 30104 C9',
    tagline     = 'Clean geometry. Quiet authority. Cartier.',
    description = 'A rectangular optical frame in metal, the 30104 C9 brings Cartier''s signature proportional exactness to everyday wear. The 54mm lens width and 15mm bridge sit close to the face, reducing the visual weight that heavier frames carry. Built for the wearer who values presence without performance — at home in both a client meeting and a quiet evening.
• Precision metal frame — thin profile, light weight, and long-term structural integrity
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Boardroom-precise proportions that read as intentional from any angle',
    color       = NULL,
    material    = 'Metal',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, '30104 C9', 'Rectangular', 'Metal', NULL,
     54, 15, 145,
     38, 127,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Client meetings / Fine dining')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = '30104 C9',
    frame_shape  = 'Rectangular',
    frame_material = 'Metal',
    lens_width   = 54,
    bridge_size  = 15,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 127,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Client meetings / Fine dining';
END $$;

-- MH-220: Polaroid PLD D508/G J5G
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-220', 'Polaroid PLD D508/G J5G', 'Polaroid', 'm_and_h_fashion',
     'frames', 125000, 'Polaroid keeps it simple and gets it right.',
     'The Polaroid PLD D508/G J5G is a rectangular frame designed for straightforward, all-day prescription wear. At 53mm wide in acetate, the fit is consistent and the weight stays easy throughout the day. Practical, dependable, and priced for daily use.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Polaroid PLD D508/G J5G',
    tagline     = 'Polaroid keeps it simple and gets it right.',
    description = 'The Polaroid PLD D508/G J5G is a rectangular frame designed for straightforward, all-day prescription wear. At 53mm wide in acetate, the fit is consistent and the weight stays easy throughout the day. Practical, dependable, and priced for daily use.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'PLD D508/G J5G', 'Rectangular', 'Acetate', NULL,
     53, 17, 145,
     36, 127,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'PLD D508/G J5G',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 127,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1476: Sandro SD3017 940
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1476', 'Sandro SD3017 940', 'Sandro', 'm_and_h_fashion',
     'frames', 120000, 'A rectangular frame designed for daily confidence.',
     'The Sandro SD3017 940 is a rectangular optical frame with the kind of clean French-label restraint the brand is known for. At 56mm in acetate, it wears lightly and reads as considered. Works as well with weekend dressing as it does with tailoring.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Sandro SD3017 940',
    tagline     = 'A rectangular frame designed for daily confidence.',
    description = 'The Sandro SD3017 940 is a rectangular optical frame with the kind of clean French-label restraint the brand is known for. At 56mm in acetate, it wears lightly and reads as considered. Works as well with weekend dressing as it does with tailoring.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'SD3017 940', 'Rectangular', 'Acetate', NULL,
     56, 17, 140,
     38, 133,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'SD3017 940',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 56,
    bridge_size  = 17,
    temple_length = 140,
    lens_height  = 38,
    total_width  = 133,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1480: Daniel Hechter DHM193-7
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1480', 'Daniel Hechter DHM193-7', 'Daniel Hechter', 'm_and_h_fashion',
     'frames', 120000, 'Daniel Hechter: French cut, everyday use.',
     'The Daniel Hechter DHM193-7 is a rectangular frame with the measured proportions that French label DNA demands. At 53mm wide in acetate, it carries a clean everyday weight without becoming anonymous. Suits any prescription range and holds up across a full working week.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Daniel Hechter DHM193-7',
    tagline     = 'Daniel Hechter: French cut, everyday use.',
    description = 'The Daniel Hechter DHM193-7 is a rectangular frame with the measured proportions that French label DNA demands. At 53mm wide in acetate, it carries a clean everyday weight without becoming anonymous. Suits any prescription range and holds up across a full working week.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DHM193-7', 'Rectangular', 'Acetate', NULL,
     53, 16, 135,
     36, 126,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DHM193-7',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 16,
    temple_length = 135,
    lens_height  = 36,
    total_width  = 126,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1482: Daniel Hechter DHM281-7 P620
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1482', 'Daniel Hechter DHM281-7 P620', 'Daniel Hechter', 'm_and_h_fashion',
     'frames', 120000, 'Daniel Hechter: French cut, everyday use.',
     'The Daniel Hechter DHM281-7 P620 is a rectangular frame with the measured proportions that French label DNA demands. At 52mm wide in acetate, it carries a clean everyday weight without becoming anonymous. Suits any prescription range and holds up across a full working week.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Daniel Hechter DHM281-7 P620',
    tagline     = 'Daniel Hechter: French cut, everyday use.',
    description = 'The Daniel Hechter DHM281-7 P620 is a rectangular frame with the measured proportions that French label DNA demands. At 52mm wide in acetate, it carries a clean everyday weight without becoming anonymous. Suits any prescription range and holds up across a full working week.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DHM281-7 P620', 'Rectangular', 'Acetate', NULL,
     52, 17, 140,
     36, 125,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DHM281-7 P620',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 52,
    bridge_size  = 17,
    temple_length = 140,
    lens_height  = 36,
    total_width  = 125,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1483: Daniel Hechter DHP614-2 P520
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1483', 'Daniel Hechter DHP614-2 P520', 'Daniel Hechter', 'm_and_h_fashion',
     'frames', 120000, 'Daniel Hechter: French cut, everyday use.',
     'The Daniel Hechter DHP614-2 P520 is a rectangular frame with the measured proportions that French label DNA demands. At 52mm wide in acetate, it carries a clean everyday weight without becoming anonymous. Suits any prescription range and holds up across a full working week.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Daniel Hechter DHP614-2 P520',
    tagline     = 'Daniel Hechter: French cut, everyday use.',
    description = 'The Daniel Hechter DHP614-2 P520 is a rectangular frame with the measured proportions that French label DNA demands. At 52mm wide in acetate, it carries a clean everyday weight without becoming anonymous. Suits any prescription range and holds up across a full working week.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DHP614-2 P520', 'Rectangular', 'Acetate', NULL,
     52, 19, 145,
     36, 127,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DHP614-2 P520',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 52,
    bridge_size  = 19,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 127,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-414: Daniel Hechter DHM378-3 1/P222
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-414', 'Daniel Hechter DHM378-3 1/P222', 'Daniel Hechter', 'm_and_h_fashion',
     'frames', 120000, 'Daniel Hechter: French cut, everyday use.',
     'The Daniel Hechter DHM378-3 1/P222 is a rectangular frame with the measured proportions that French label DNA demands. At 55mm wide in acetate, it carries a clean everyday weight without becoming anonymous. Suits any prescription range and holds up across a full working week.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Daniel Hechter DHM378-3 1/P222',
    tagline     = 'Daniel Hechter: French cut, everyday use.',
    description = 'The Daniel Hechter DHM378-3 1/P222 is a rectangular frame with the measured proportions that French label DNA demands. At 55mm wide in acetate, it carries a clean everyday weight without becoming anonymous. Suits any prescription range and holds up across a full working week.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'DHM378-3 1/P222', 'Rectangular', 'Acetate', NULL,
     55, 16, 145,
     38, 130,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'DHM378-3 1/P222',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 55,
    bridge_size  = 16,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 130,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-328: Macruona MB1402-A C5
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-328', 'Macruona MB1402-A C5', 'Macruona', 'm_and_h_fashion',
     'frames', 70000, 'The frame that stays out of the way.',
     'The Macruona MB1402-A C5 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 19mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona MB1402-A C5',
    tagline     = 'The frame that stays out of the way.',
    description = 'The Macruona MB1402-A C5 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 19mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'MB1402-A C5', 'Rectangular', 'Acetate', NULL,
     54, 19, 145,
     38, 131,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'MB1402-A C5',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 19,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 131,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-354: Macruona 8592 C1
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-354', 'Macruona 8592 C1', 'Macruona', 'm_and_h_fashion',
     'frames', 70000, 'The frame that stays out of the way.',
     'The Macruona 8592 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 53mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona 8592 C1',
    tagline     = 'The frame that stays out of the way.',
    description = 'The Macruona 8592 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 53mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, '8592 C1', 'Rectangular', 'Acetate', NULL,
     53, 17, 142,
     36, 127,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = '8592 C1',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 17,
    temple_length = 142,
    lens_height  = 36,
    total_width  = 127,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-355: Macruona XL110 C3
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-355', 'Macruona XL110 C3', 'Macruona', 'm_and_h_fashion',
     'frames', 70000, 'Lightweight and reliable — the practical choice.',
     'The Macruona XL110 C3 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 52mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona XL110 C3',
    tagline     = 'Lightweight and reliable — the practical choice.',
    description = 'The Macruona XL110 C3 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 52mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 52mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'XL110 C3', 'Rectangular', 'Acetate', NULL,
     52, 17, 145,
     36, 125,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'XL110 C3',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 52,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 125,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-367: Macruona D3333 C5
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-367', 'Macruona D3333 C5', 'Macruona', 'm_and_h_fashion',
     'frames', 70000, 'Full-rim prescription wear that earns its keep.',
     'The Macruona D3333 C5 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 53mm wide with acetate construction and a 16mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona D3333 C5',
    tagline     = 'Full-rim prescription wear that earns its keep.',
    description = 'The Macruona D3333 C5 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 53mm wide with acetate construction and a 16mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'D3333 C5', 'Rectangular', 'Acetate', NULL,
     53, 16, 142,
     36, 126,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'D3333 C5',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 16,
    temple_length = 142,
    lens_height  = 36,
    total_width  = 126,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-370: Macruona TA9067 C5
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-370', 'Macruona TA9067 C5', 'Macruona', 'm_and_h_fashion',
     'frames', 70000, 'Clean edges. Secure fit. Ready for any day.',
     'The Macruona TA9067 C5 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 51mm wide with acetate construction and a 20mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 51mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona TA9067 C5',
    tagline     = 'Clean edges. Secure fit. Ready for any day.',
    description = 'The Macruona TA9067 C5 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 51mm wide with acetate construction and a 20mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 51mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'TA9067 C5', 'Rectangular', 'Acetate', NULL,
     51, 20, 140,
     36, 126,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'TA9067 C5',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 51,
    bridge_size  = 20,
    temple_length = 140,
    lens_height  = 36,
    total_width  = 126,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-396: Macruona MG3850 C5
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-396', 'Macruona MG3850 C5', 'Macruona', 'm_and_h_fashion',
     'frames', 70000, 'Solid build. Neutral profile. All-day comfortable.',
     'The Macruona MG3850 C5 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 55mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona MG3850 C5',
    tagline     = 'Solid build. Neutral profile. All-day comfortable.',
    description = 'The Macruona MG3850 C5 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 55mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'MG3850 C5', 'Rectangular', 'Acetate', NULL,
     55, 17, 142,
     38, 131,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'MG3850 C5',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 55,
    bridge_size  = 17,
    temple_length = 142,
    lens_height  = 38,
    total_width  = 131,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-361: Macruona D3337 C1
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-361', 'Macruona D3337 C1', 'Macruona', 'm_and_h_fashion',
     'frames', 65000, 'A prescription frame that simply works.',
     'The Macruona D3337 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 56mm wide with acetate construction and a 18mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona D3337 C1',
    tagline     = 'A prescription frame that simply works.',
    description = 'The Macruona D3337 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 56mm wide with acetate construction and a 18mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'D3337 C1', 'Rectangular', 'Acetate', NULL,
     56, 18, 145,
     38, 134,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'D3337 C1',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 56,
    bridge_size  = 18,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 134,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-372: Macruona D3337 C2
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-372', 'Macruona D3337 C2', 'Macruona', 'm_and_h_fashion',
     'frames', 65000, 'A prescription frame that simply works.',
     'The Macruona D3337 C2 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 56mm wide with acetate construction and a 18mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona D3337 C2',
    tagline     = 'A prescription frame that simply works.',
    description = 'The Macruona D3337 C2 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 56mm wide with acetate construction and a 18mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'D3337 C2', 'Rectangular', 'Acetate', NULL,
     56, 18, 145,
     38, 134,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'D3337 C2',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 56,
    bridge_size  = 18,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 134,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-399: Macruona 9869 C1
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-399', 'Macruona 9869 C1', 'Macruona', 'm_and_h_fashion',
     'frames', 65000, 'Built for the long week, not the photo shoot.',
     'The Macruona 9869 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 55mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona 9869 C1',
    tagline     = 'Built for the long week, not the photo shoot.',
    description = 'The Macruona 9869 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 55mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, '9869 C1', 'Rectangular', 'Acetate', NULL,
     55, 17, 145,
     38, 131,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = '9869 C1',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 55,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 131,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-344: Macruona MB1403 C4
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-344', 'Macruona MB1403 C4', 'Macruona', 'm_and_h_fashion',
     'frames', 60000, 'Clean rectangular profile. Practical in every way.',
     'The Macruona MB1403 C4 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 49mm wide with acetate construction and a 19mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 49mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona MB1403 C4',
    tagline     = 'Clean rectangular profile. Practical in every way.',
    description = 'The Macruona MB1403 C4 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 49mm wide with acetate construction and a 19mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 49mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'MB1403 C4', 'Rectangular', 'Acetate', NULL,
     49, 19, 140,
     34, 121,
     54, 68, -8.00, +6.00,
     true, 'Narrow', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'MB1403 C4',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 49,
    bridge_size  = 19,
    temple_length = 140,
    lens_height  = 34,
    total_width  = 121,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Narrow',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-357: Macruona TA9067 C4
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-357', 'Macruona TA9067 C4', 'Macruona', 'm_and_h_fashion',
     'frames', 60000, 'Built for the long week, not the photo shoot.',
     'The Macruona TA9067 C4 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 51mm wide with acetate construction and a 20mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 51mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona TA9067 C4',
    tagline     = 'Built for the long week, not the photo shoot.',
    description = 'The Macruona TA9067 C4 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 51mm wide with acetate construction and a 20mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 51mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'TA9067 C4', 'Rectangular', 'Acetate', NULL,
     51, 20, 140,
     36, 126,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'TA9067 C4',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 51,
    bridge_size  = 20,
    temple_length = 140,
    lens_height  = 36,
    total_width  = 126,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-358: Macruona TA9067 C1
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-358', 'Macruona TA9067 C1', 'Macruona', 'm_and_h_fashion',
     'frames', 60000, 'Reliable fit. Consistent weight. No surprises.',
     'The Macruona TA9067 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 51mm wide with acetate construction and a 20mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 51mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona TA9067 C1',
    tagline     = 'Reliable fit. Consistent weight. No surprises.',
    description = 'The Macruona TA9067 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 51mm wide with acetate construction and a 20mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 51mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'TA9067 C1', 'Rectangular', 'Acetate', NULL,
     51, 20, 140,
     36, 126,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'TA9067 C1',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 51,
    bridge_size  = 20,
    temple_length = 140,
    lens_height  = 36,
    total_width  = 126,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-398: Macruona PY-526 C8
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-398', 'Macruona PY-526 C8', 'Macruona', 'm_and_h_fashion',
     'frames', 60000, 'A prescription frame that simply works.',
     'The Macruona PY-526 C8 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Practical sun protection with a clean silhouette that pairs with casual and smart-casual dressing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona PY-526 C8',
    tagline     = 'A prescription frame that simply works.',
    description = 'The Macruona PY-526 C8 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 17mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Practical sun protection with a clean silhouette that pairs with casual and smart-casual dressing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'PY-526 C8', 'Rectangular', 'Acetate', NULL,
     54, 17, 145,
     38, 129,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Casual / Outdoor / Everyday')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'PY-526 C8',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 129,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Casual / Outdoor / Everyday';
END $$;

-- MH-406: Macruona TA9068 C2
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-406', 'Macruona TA9068 C2', 'Macruona', 'm_and_h_fashion',
     'frames', 60000, 'Everyday frame. Clean lines. Does the job.',
     'The Macruona TA9068 C2 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 19mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona TA9068 C2',
    tagline     = 'Everyday frame. Clean lines. Does the job.',
    description = 'The Macruona TA9068 C2 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 19mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'TA9068 C2', 'Rectangular', 'Acetate', NULL,
     54, 19, 142,
     38, 131,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'TA9068 C2',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 19,
    temple_length = 142,
    lens_height  = 38,
    total_width  = 131,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-576: Guess GU2878 071
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-576', 'Guess GU2878 071', 'Guess', 'm_and_h_fashion',
     'frames', 55000, 'Guess brings the look without the weight.',
     'The Guess GU2878 071 is a rectangular frame that delivers the brand''s fashion instinct at an everyday price. At 55mm wide in acetate, the proportions are easy to wear and pair with most styles. Sharp enough for the office, relaxed enough for the weekend.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Guess GU2878 071',
    tagline     = 'Guess brings the look without the weight.',
    description = 'The Guess GU2878 071 is a rectangular frame that delivers the brand''s fashion instinct at an everyday price. At 55mm wide in acetate, the proportions are easy to wear and pair with most styles. Sharp enough for the office, relaxed enough for the weekend.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'GU2878 071', 'Rectangular', 'Acetate', NULL,
     55, 15, 140,
     38, 129,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'GU2878 071',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 55,
    bridge_size  = 15,
    temple_length = 140,
    lens_height  = 38,
    total_width  = 129,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-1400: Columbia C3016 201
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1400', 'Columbia C3016 201', 'Columbia', 'm_and_h_fashion',
     'frames', 50000, 'A rectangular frame designed for daily confidence.',
     'The Columbia C3016 201 is a rectangular frame designed for consistent, all-day prescription wear. At 59mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Wider 59mm lens profile flatters oval and oblong faces; the generous size gives the prescription more working area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Columbia C3016 201',
    tagline     = 'A rectangular frame designed for daily confidence.',
    description = 'The Columbia C3016 201 is a rectangular frame designed for consistent, all-day prescription wear. At 59mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Wider 59mm lens profile flatters oval and oblong faces; the generous size gives the prescription more working area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'C3016 201', 'Rectangular', 'Acetate', NULL,
     59, 17, 150,
     40, 139,
     58, 76, -8.00, +6.00,
     true, 'Large', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'C3016 201',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 59,
    bridge_size  = 17,
    temple_length = 150,
    lens_height  = 40,
    total_width  = 139,
    pd_range_min = 58, pd_range_max = 76,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Large',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1403: Columbia C3015 072
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1403', 'Columbia C3015 072', 'Columbia', 'm_and_h_fashion',
     'frames', 50000, 'A rectangular frame designed for daily confidence.',
     'The Columbia C3015 072 is a rectangular frame designed for consistent, all-day prescription wear. At 61mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Oversized 61mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Columbia C3015 072',
    tagline     = 'A rectangular frame designed for daily confidence.',
    description = 'The Columbia C3015 072 is a rectangular frame designed for consistent, all-day prescription wear. At 61mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Oversized 61mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'C3015 072', 'Rectangular', 'Acetate', NULL,
     61, 17, 150,
     42, 143,
     58, 76, -8.00, +6.00,
     true, 'Extra Large', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'C3015 072',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 61,
    bridge_size  = 17,
    temple_length = 150,
    lens_height  = 42,
    total_width  = 143,
    pd_range_min = 58, pd_range_max = 76,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Extra Large',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1405: Columbia C8036 022
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1405', 'Columbia C8036 022', 'Columbia', 'm_and_h_fashion',
     'frames', 50000, 'A rectangular frame designed for daily confidence.',
     'The Columbia C8036 022 is a rectangular frame designed for consistent, all-day prescription wear. At 57mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Wider 57mm lens profile flatters oval and oblong faces; the generous size gives the prescription more working area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Columbia C8036 022',
    tagline     = 'A rectangular frame designed for daily confidence.',
    description = 'The Columbia C8036 022 is a rectangular frame designed for consistent, all-day prescription wear. At 57mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Wider 57mm lens profile flatters oval and oblong faces; the generous size gives the prescription more working area — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'C8036 022', 'Rectangular', 'Acetate', NULL,
     57, 17, 150,
     40, 135,
     58, 76, -8.00, +6.00,
     true, 'Large', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'C8036 022',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 57,
    bridge_size  = 17,
    temple_length = 150,
    lens_height  = 40,
    total_width  = 135,
    pd_range_min = 58, pd_range_max = 76,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Large',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-337: Macruona 8563 C2
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-337', 'Macruona 8563 C2', 'Macruona', 'm_and_h_fashion',
     'frames', 50000, 'The frame that stays out of the way.',
     'The Macruona 8563 C2 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 16mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona 8563 C2',
    tagline     = 'The frame that stays out of the way.',
    description = 'The Macruona 8563 C2 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 16mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, '8563 C2', 'Rectangular', 'Acetate', NULL,
     54, 16, 140,
     38, 128,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = '8563 C2',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 16,
    temple_length = 140,
    lens_height  = 38,
    total_width  = 128,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-338: Macruona 8563 C1
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-338', 'Macruona 8563 C1', 'Macruona', 'm_and_h_fashion',
     'frames', 50000, 'Reliable fit. Consistent weight. No surprises.',
     'The Macruona 8563 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 16mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona 8563 C1',
    tagline     = 'Reliable fit. Consistent weight. No surprises.',
    description = 'The Macruona 8563 C1 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 16mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, '8563 C1', 'Rectangular', 'Acetate', NULL,
     54, 16, 140,
     38, 128,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = '8563 C1',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 16,
    temple_length = 140,
    lens_height  = 38,
    total_width  = 128,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-350: Macruona 8563 C3
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-350', 'Macruona 8563 C3', 'Macruona', 'm_and_h_fashion',
     'frames', 50000, 'Reliable fit. Consistent weight. No surprises.',
     'The Macruona 8563 C3 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 16mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona 8563 C3',
    tagline     = 'Reliable fit. Consistent weight. No surprises.',
    description = 'The Macruona 8563 C3 is a full-rim rectangular frame built for reliable, everyday prescription wear. At 54mm wide with acetate construction and a 16mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, '8563 C3', 'Rectangular', 'Acetate', NULL,
     54, 16, 140,
     38, 128,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = '8563 C3',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 16,
    temple_length = 140,
    lens_height  = 38,
    total_width  = 128,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-551: Pepper Jean PJ1301 C4 TOPSY
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-551', 'Pepper Jean PJ1301 C4 TOPSY', 'Pepper Jean', 'm_and_h_fashion',
     'frames', 50000, 'A rectangular frame designed for daily confidence.',
     'The Pepper Jean PJ1301 C4 TOPSY is a rectangular frame designed for consistent, all-day prescription wear. At 53mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Pepper Jean PJ1301 C4 TOPSY',
    tagline     = 'A rectangular frame designed for daily confidence.',
    description = 'The Pepper Jean PJ1301 C4 TOPSY is a rectangular frame designed for consistent, all-day prescription wear. At 53mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'PJ1301 C4 TOPSY', 'Rectangular', 'Acetate', NULL,
     53, 17, 135,
     36, 127,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'PJ1301 C4 TOPSY',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 17,
    temple_length = 135,
    lens_height  = 36,
    total_width  = 127,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-569: Sandro SD6018 118
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-569', 'Sandro SD6018 118', 'Sandro', 'm_and_h_fashion',
     'frames', 50000, 'Sandro''s cat-eye: Parisian, not precious.',
     'Sandro''s SD6018 118 is a Parisian cat-eye that lands the ''60s silhouette without over-committing to nostalgia. The 54mm width sits right for both wider and medium face shapes, making it more versatile than the shape suggests. Works as well with weekend dressing as it does with tailoring.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• UV400 sun lens keeps eyes protected; the silhouette keeps the look current',
     NULL, 'Acetate', 'Cat-Eye',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Sandro SD6018 118',
    tagline     = 'Sandro''s cat-eye: Parisian, not precious.',
    description = 'Sandro''s SD6018 118 is a Parisian cat-eye that lands the ''60s silhouette without over-committing to nostalgia. The 54mm width sits right for both wider and medium face shapes, making it more versatile than the shape suggests. Works as well with weekend dressing as it does with tailoring.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• UV400 sun lens keeps eyes protected; the silhouette keeps the look current',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Cat-Eye',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'SD6018 118', 'Cat-Eye', 'Acetate', NULL,
     54, 17, 140,
     36, 129,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Square, Diamond', 'Outdoor / Casual / Driving')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'SD6018 118',
    frame_shape  = 'Cat-Eye',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 17,
    temple_length = 140,
    lens_height  = 36,
    total_width  = 129,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Square, Diamond',
    best_for_occasions = 'Outdoor / Casual / Driving';
END $$;

-- MH-1399: Cole Haan CH4045 971 CRYSTAL
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1399', 'Cole Haan CH4045 971 CRYSTAL', 'Cole Haan', 'm_and_h_fashion',
     'frames', 45000, 'A rectangular frame designed for daily confidence.',
     'The Cole Haan CH4045 971 CRYSTAL is a rectangular frame designed for consistent, all-day prescription wear. At 53mm wide in acetate with a 18mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
     'Crystal', 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Cole Haan CH4045 971 CRYSTAL',
    tagline     = 'A rectangular frame designed for daily confidence.',
    description = 'The Cole Haan CH4045 971 CRYSTAL is a rectangular frame designed for consistent, all-day prescription wear. At 53mm wide in acetate with a 18mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 53mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Clean profile works across professional and casual dressing — no adjustment needed',
    color       = 'Crystal',
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'CH4045 971 CRYSTAL', 'Rectangular', 'Acetate', 'Crystal',
     53, 18, 140,
     36, 128,
     54, 68, -8.00, +6.00,
     true, 'Small', 'Oval, Round, Heart', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'CH4045 971 CRYSTAL',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 53,
    bridge_size  = 18,
    temple_length = 140,
    lens_height  = 36,
    total_width  = 128,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Small',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1371: Swarovski SW 1028 16W
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1371', 'Swarovski SW 1028 16W', 'Swarovski', 'm_and_h_fashion',
     'frames', 40000, 'A Swarovski wayfarer that shines without shouting.',
     'The Swarovski SW 1028 16W brings the house''s crystal craft into a wayfarer frame designed to be noticed for all the right reasons. At 60mm wide in acetate, the proportions keep it wearable day-to-day, not just for special occasions. A frame that adds a moment of sparkle to the everyday.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Oversized 60mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• The wayfarer shape works on most face types; this one delivers the classic look at a practical price',
     'Swarovski', 'Acetate', 'Wayfarer',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Swarovski SW 1028 16W',
    tagline     = 'A Swarovski wayfarer that shines without shouting.',
    description = 'The Swarovski SW 1028 16W brings the house''s crystal craft into a wayfarer frame designed to be noticed for all the right reasons. At 60mm wide in acetate, the proportions keep it wearable day-to-day, not just for special occasions. A frame that adds a moment of sparkle to the everyday.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Oversized 60mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• The wayfarer shape works on most face types; this one delivers the classic look at a practical price',
    color       = 'Swarovski',
    material    = 'Acetate',
    style       = 'Wayfarer',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'SW 1028 16W', 'Wayfarer', 'Acetate', 'Swarovski',
     60, 16, 140,
     46, 140,
     58, 76, -8.00, +6.00,
     true, 'Extra Large', 'Oval, Square, Round', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'SW 1028 16W',
    frame_shape  = 'Wayfarer',
    frame_material = 'Acetate',
    lens_width   = 60,
    bridge_size  = 16,
    temple_length = 140,
    lens_height  = 46,
    total_width  = 140,
    pd_range_min = 58, pd_range_max = 76,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Extra Large',
    best_for_faces     = 'Oval, Square, Round',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1372: Swarovski SW 1028 18M
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1372', 'Swarovski SW 1028 18M', 'Swarovski', 'm_and_h_fashion',
     'frames', 40000, 'A Swarovski wayfarer that shines without shouting.',
     'The Swarovski SW 1028 18M brings the house''s crystal craft into a wayfarer frame designed to be noticed for all the right reasons. At 60mm wide in acetate, the proportions keep it wearable day-to-day, not just for special occasions. A frame that adds a moment of sparkle to the everyday.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Oversized 60mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• The wayfarer shape works on most face types; this one delivers the classic look at a practical price',
     'Swarovski', 'Acetate', 'Wayfarer',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Swarovski SW 1028 18M',
    tagline     = 'A Swarovski wayfarer that shines without shouting.',
    description = 'The Swarovski SW 1028 18M brings the house''s crystal craft into a wayfarer frame designed to be noticed for all the right reasons. At 60mm wide in acetate, the proportions keep it wearable day-to-day, not just for special occasions. A frame that adds a moment of sparkle to the everyday.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Oversized 60mm lens format — designed to make a proportional statement while maintaining full optical clarity — progressive lens compatible
• The wayfarer shape works on most face types; this one delivers the classic look at a practical price',
    color       = 'Swarovski',
    material    = 'Acetate',
    style       = 'Wayfarer',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'SW 1028 18M', 'Wayfarer', 'Acetate', 'Swarovski',
     60, 16, 140,
     46, 140,
     58, 76, -8.00, +6.00,
     true, 'Extra Large', 'Oval, Square, Round', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'SW 1028 18M',
    frame_shape  = 'Wayfarer',
    frame_material = 'Acetate',
    lens_width   = 60,
    bridge_size  = 16,
    temple_length = 140,
    lens_height  = 46,
    total_width  = 140,
    pd_range_min = 58, pd_range_max = 76,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Extra Large',
    best_for_faces     = 'Oval, Square, Round',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1380: Linda Farrow LFL/351/2
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1380', 'Linda Farrow LFL/351/2', 'Linda Farrow', 'm_and_h_fashion',
     'frames', 40000, 'Linda Farrow''s cat-eye earns a second look.',
     'Linda Farrow''s LFL/351/2 is a cat-eye built around considered proportions — the sweep at the outer corners is measured, not dramatic. The 56mm width keeps it wearable across face shapes that typically struggle with angular frames. The kind of frame that photographers notice before they ask about it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Sun protection built into a frame with enough character to stand alone as a style statement',
     NULL, 'Acetate', 'Cat-Eye',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Linda Farrow LFL/351/2',
    tagline     = 'Linda Farrow''s cat-eye earns a second look.',
    description = 'Linda Farrow''s LFL/351/2 is a cat-eye built around considered proportions — the sweep at the outer corners is measured, not dramatic. The 56mm width keeps it wearable across face shapes that typically struggle with angular frames. The kind of frame that photographers notice before they ask about it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Sun protection built into a frame with enough character to stand alone as a style statement',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Cat-Eye',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'LFL/351/2', 'Cat-Eye', 'Acetate', NULL,
     56, 17, 145,
     36, 133,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Square, Diamond', 'Leisure / Travel / Casual dressing')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'LFL/351/2',
    frame_shape  = 'Cat-Eye',
    frame_material = 'Acetate',
    lens_width   = 56,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 133,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Square, Diamond',
    best_for_occasions = 'Leisure / Travel / Casual dressing';
END $$;

-- MH-1381: Linda Farrow LFL/351/4
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1381', 'Linda Farrow LFL/351/4', 'Linda Farrow', 'm_and_h_fashion',
     'frames', 40000, 'Linda Farrow''s cat-eye earns a second look.',
     'Linda Farrow''s LFL/351/4 is a cat-eye built around considered proportions — the sweep at the outer corners is measured, not dramatic. The 56mm width keeps it wearable across face shapes that typically struggle with angular frames. The kind of frame that photographers notice before they ask about it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Sun protection built into a frame with enough character to stand alone as a style statement',
     NULL, 'Acetate', 'Cat-Eye',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Linda Farrow LFL/351/4',
    tagline     = 'Linda Farrow''s cat-eye earns a second look.',
    description = 'Linda Farrow''s LFL/351/4 is a cat-eye built around considered proportions — the sweep at the outer corners is measured, not dramatic. The 56mm width keeps it wearable across face shapes that typically struggle with angular frames. The kind of frame that photographers notice before they ask about it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Sun protection built into a frame with enough character to stand alone as a style statement',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Cat-Eye',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'LFL/351/4', 'Cat-Eye', 'Acetate', NULL,
     56, 17, 145,
     36, 133,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Square, Diamond', 'Leisure / Travel / Casual dressing')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'LFL/351/4',
    frame_shape  = 'Cat-Eye',
    frame_material = 'Acetate',
    lens_width   = 56,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 133,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Square, Diamond',
    best_for_occasions = 'Leisure / Travel / Casual dressing';
END $$;

-- MH-330: Macruona MR01-01 C.01H
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-330', 'Macruona MR01-01 C.01H', 'Macruona', 'm_and_h_fashion',
     'frames', 40000, 'A prescription frame that simply works.',
     'The Macruona MR01-01 C.01H is a full-rim rectangular frame built for reliable, everyday prescription wear. At 49mm wide with acetate construction and a 21mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 49mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona MR01-01 C.01H',
    tagline     = 'A prescription frame that simply works.',
    description = 'The Macruona MR01-01 C.01H is a full-rim rectangular frame built for reliable, everyday prescription wear. At 49mm wide with acetate construction and a 21mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 49mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'MR01-01 C.01H', 'Rectangular', 'Acetate', NULL,
     49, 21, 145,
     34, 123,
     54, 68, -8.00, +6.00,
     true, 'Narrow', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'MR01-01 C.01H',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 49,
    bridge_size  = 21,
    temple_length = 145,
    lens_height  = 34,
    total_width  = 123,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Narrow',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-1595: Gentle Monster LOVE PUNCH COL.02
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1595', 'Gentle Monster LOVE PUNCH COL.02', 'Gentle Monster', 'm_and_h_fashion',
     'frames', 35000, 'A cat-eye frame designed for daily confidence.',
     'The Gentle Monster LOVE PUNCH COL.02 is a cat-eye frame built with the precision the brand''s design reputation demands. At 55mm wide in acetate, it commands attention without overplaying its hand. A frame for the wearer who dresses intentionally.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• An upswept corner that lifts the eyes — flattering, distinctive, deliberately chosen',
     NULL, 'Acetate', 'Cat-Eye',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Gentle Monster LOVE PUNCH COL.02',
    tagline     = 'A cat-eye frame designed for daily confidence.',
    description = 'The Gentle Monster LOVE PUNCH COL.02 is a cat-eye frame built with the precision the brand''s design reputation demands. At 55mm wide in acetate, it commands attention without overplaying its hand. A frame for the wearer who dresses intentionally.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 55mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• An upswept corner that lifts the eyes — flattering, distinctive, deliberately chosen',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Cat-Eye',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'LOVE PUNCH COL.02', 'Cat-Eye', 'Acetate', NULL,
     55, 20, 145,
     36, 134,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Square, Diamond', 'Work / Creative settings / Going out')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'LOVE PUNCH COL.02',
    frame_shape  = 'Cat-Eye',
    frame_material = 'Acetate',
    lens_width   = 55,
    bridge_size  = 20,
    temple_length = 145,
    lens_height  = 36,
    total_width  = 134,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Square, Diamond',
    best_for_occasions = 'Work / Creative settings / Going out';
END $$;

-- MH-362: Macruona FE06-12 C.03
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-362', 'Macruona FE06-12 C.03', 'Macruona', 'm_and_h_fashion',
     'frames', 35000, 'Lightweight and reliable — the practical choice.',
     'The Macruona FE06-12 C.03 is a full-rim square frame built for reliable, everyday prescription wear. At 48mm wide with acetate construction and a 22mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 48mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• The square silhouette works across professional and casual dressing alike',
     NULL, 'Acetate', 'Square',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona FE06-12 C.03',
    tagline     = 'Lightweight and reliable — the practical choice.',
    description = 'The Macruona FE06-12 C.03 is a full-rim square frame built for reliable, everyday prescription wear. At 48mm wide with acetate construction and a 22mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 48mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• The square silhouette works across professional and casual dressing alike',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Square',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'FE06-12 C.03', 'Square', 'Acetate', NULL,
     48, 22, 145,
     38, 122,
     54, 68, -8.00, +6.00,
     true, 'Narrow', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'FE06-12 C.03',
    frame_shape  = 'Square',
    frame_material = 'Acetate',
    lens_width   = 48,
    bridge_size  = 22,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 122,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Narrow',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-400: Macruona FE06-12 C.01
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-400', 'Macruona FE06-12 C.01', 'Macruona', 'm_and_h_fashion',
     'frames', 35000, 'Clean square profile. Practical in every way.',
     'The Macruona FE06-12 C.01 is a full-rim square frame built for reliable, everyday prescription wear. At 48mm wide with acetate construction and a 22mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 48mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• The square silhouette works across professional and casual dressing alike',
     NULL, 'Acetate', 'Square',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Macruona FE06-12 C.01',
    tagline     = 'Clean square profile. Practical in every way.',
    description = 'The Macruona FE06-12 C.01 is a full-rim square frame built for reliable, everyday prescription wear. At 48mm wide with acetate construction and a 22mm bridge, it fits a broad range of faces comfortably. Functional, well-proportioned, and built to handle a full working week without complaint.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Compact 48mm lens width suits narrower faces and smaller frame preferences without sacrificing lens area — progressive lens compatible
• The square silhouette works across professional and casual dressing alike',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Square',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'FE06-12 C.01', 'Square', 'Acetate', NULL,
     48, 22, 145,
     38, 122,
     54, 68, -8.00, +6.00,
     true, 'Narrow', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'FE06-12 C.01',
    frame_shape  = 'Square',
    frame_material = 'Acetate',
    lens_width   = 48,
    bridge_size  = 22,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 122,
    pd_range_min = 54, pd_range_max = 68,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Narrow',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-1377: Joseph Marc ENGLER IG1803 HAVANA
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1377', 'Joseph Marc ENGLER IG1803 HAVANA', 'Joseph Marc', 'm_and_h_fashion',
     'frames', 30000, 'A wayfarer frame designed for daily confidence.',
     'The Joseph Marc ENGLER IG1803 HAVANA is a wayfarer frame designed for consistent, all-day prescription wear. At 54mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• The wayfarer shape works on most face types; this one delivers the classic look at a practical price',
     'Havana', 'Acetate', 'Wayfarer',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'Joseph Marc ENGLER IG1803 HAVANA',
    tagline     = 'A wayfarer frame designed for daily confidence.',
    description = 'The Joseph Marc ENGLER IG1803 HAVANA is a wayfarer frame designed for consistent, all-day prescription wear. At 54mm wide in acetate with a 17mm bridge, the fit is reliable and the look is clean. Versatile enough for the whole week, comfortable enough for all of it.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• The wayfarer shape works on most face types; this one delivers the classic look at a practical price',
    color       = 'Havana',
    material    = 'Acetate',
    style       = 'Wayfarer',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'ENGLER IG1803 HAVANA', 'Wayfarer', 'Acetate', 'Havana',
     54, 17, 145,
     42, 129,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Square, Round', 'Work / Casual / All-day wear')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'ENGLER IG1803 HAVANA',
    frame_shape  = 'Wayfarer',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 42,
    total_width  = 129,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Square, Round',
    best_for_occasions = 'Work / Casual / All-day wear';
END $$;

-- MH-1651: M&H BS1003 C9
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1651', 'M&H BS1003 C9', 'M&H', 'm_and_h_fashion',
     'frames', 30000, 'M&H house frame — built for real-world wear.',
     'The M&H BS1003 C9 is our in-house rectangular frame — designed to the same specification standards as our branded range. At 56mm wide in acetate, it covers the full prescription range with a clean, neutral silhouette. The go-to choice when wearability and value both matter.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'M&H BS1003 C9',
    tagline     = 'M&H house frame — built for real-world wear.',
    description = 'The M&H BS1003 C9 is our in-house rectangular frame — designed to the same specification standards as our branded range. At 56mm wide in acetate, it covers the full prescription range with a clean, neutral silhouette. The go-to choice when wearability and value both matter.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 56mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'BS1003 C9', 'Rectangular', 'Acetate', NULL,
     56, 17, 145,
     38, 133,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'BS1003 C9',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 56,
    bridge_size  = 17,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 133,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;

-- MH-1654: M&H FD8819 C2
DO $$
DECLARE _pid uuid;
BEGIN
  -- Upsert product
  INSERT INTO public.products
    (sku, name, brand, brand_line, item_type, price, tagline, description,
     color, material, style, gender, is_active, record_type)
  VALUES
    ('MH-1654', 'M&H FD8819 C2', 'M&H', 'm_and_h_fashion',
     'frames', 30000, 'M&H house frame — built for real-world wear.',
     'The M&H FD8819 C2 is our in-house rectangular frame — designed to the same specification standards as our branded range. At 54mm wide in acetate, it covers the full prescription range with a clean, neutral silhouette. The go-to choice when wearability and value both matter.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
     NULL, 'Acetate', 'Rectangular',
     'unisex', true, 'inventory_item')
  ON CONFLICT (sku) DO UPDATE SET
    name        = 'M&H FD8819 C2',
    tagline     = 'M&H house frame — built for real-world wear.',
    description = 'The M&H FD8819 C2 is our in-house rectangular frame — designed to the same specification standards as our branded range. At 54mm wide in acetate, it covers the full prescription range with a clean, neutral silhouette. The go-to choice when wearability and value both matter.
• Hand-polished acetate construction — rich colour depth and comfortable temple flexibility
• Medium 54mm lens width sits in the versatile fit range — works well on oval, round, and heart-shaped faces — progressive lens compatible
• Neutral profile pairs with any wardrobe — the frame that complements without competing',
    color       = NULL,
    material    = 'Acetate',
    style       = 'Rectangular',
    gender      = 'unisex',
    is_active   = true
  RETURNING id INTO _pid;

  -- Upsert frame_attributes
  INSERT INTO public.frame_attributes
    (product_id, model_code, frame_shape, frame_material, front_color,
     lens_width, bridge_size, temple_length, lens_height, total_width,
     pd_range_min, pd_range_max, rx_sph_min, rx_sph_max,
     progressive_compatible, size_label, best_for_faces, best_for_occasions)
  VALUES
    (_pid, 'FD8819 C2', 'Rectangular', 'Acetate', NULL,
     54, 21, 145,
     38, 133,
     56, 72, -8.00, +6.00,
     true, 'Medium', 'Oval, Round, Heart', 'Daily wear / Work / Casual')
  ON CONFLICT (product_id) DO UPDATE SET
    model_code   = 'FD8819 C2',
    frame_shape  = 'Rectangular',
    frame_material = 'Acetate',
    lens_width   = 54,
    bridge_size  = 21,
    temple_length = 145,
    lens_height  = 38,
    total_width  = 133,
    pd_range_min = 56, pd_range_max = 72,
    rx_sph_min   = -8.00, rx_sph_max   = +6.00,
    progressive_compatible = true,
    size_label   = 'Medium',
    best_for_faces     = 'Oval, Round, Heart',
    best_for_occasions = 'Daily wear / Work / Casual';
END $$;
