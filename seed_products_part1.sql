-- M&H Frame Descriptions Seed
-- Paste into Lovable AFTER the schema migration SQL

-- PART 1 of 3: 23 frames (MH-471 to MH-506)

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

