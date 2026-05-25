-- M&H Frame Descriptions Seed
-- Paste into Lovable AFTER the schema migration SQL

-- PART 3 of 3: 21 frames (MH-576 to MH-1654)

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
