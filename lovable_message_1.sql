DELETE FROM inventory WHERE product_id IN (SELECT id FROM products WHERE brand_line = 'm_and_h_fashion');
DELETE FROM inventory_transactions WHERE product_id IN (SELECT id FROM products WHERE brand_line = 'm_and_h_fashion');
DELETE FROM products WHERE brand_line = 'm_and_h_fashion';
