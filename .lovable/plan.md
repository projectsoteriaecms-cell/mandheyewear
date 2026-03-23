

## Test AI Image Generation: M&H Kids Frame 8130-C6

### What we're doing
Insert a test product for **M&H Kids 8130-52 15-138 C6** into the database, generate a 6-shot AI gallery, then visually verify the output matches expectations for a children's frame.

### Frame specifications
- **Brand**: M&H Kids
- **Model**: 8130
- **Lens width**: 52mm
- **Bridge size**: 15mm
- **Temple length**: 138mm
- **Color variant**: C6

### Steps

**Step 1: Insert test product**
- Insert into `products` table: SKU `TEST-MH-KIDS-8130-C6`, name `Frame : M&H Kids 8130-52 15-138 C6`, brand `M&H Kids`, item_type `frames`, brand_line `m_and_h_fashion`, price `0`, is_active `true`
- Insert into `frame_attributes` table: lens_width `52`, bridge_size `15`, temple_length `138`, model_code `8130`, front_color `C6`

**Step 2: Generate images**
- Call `generate-product-image` edge function with the new product ID
- This will produce the standard 6-shot luxury gallery (Hero, Front, Side, Rear, Macro, Packaging)
- Since M&H Kids is a house brand, packaging will use M&H Opticals branding

**Step 3: Visual verification**
- Open the product in the browser to inspect all 6 generated shots
- Check that the frame looks appropriately sized for a children's frame given the 52-15-138 measurements
- Verify color variant C6 interpretation and M&H branding on packaging

**Step 4: Clean up**
- After verification, deactivate the test product (`is_active = false`) so it doesn't appear on the storefront

### Files changed
- No code changes — only database inserts and an edge function invocation

