-- M&H Frame Descriptions Seed
-- Paste into Lovable AFTER the schema migration SQL

-- PART 2 of 3: 23 frames (MH-131 to MH-406)

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

