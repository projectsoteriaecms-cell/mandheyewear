-- Function to deduct inventory when order items are created
CREATE OR REPLACE FUNCTION public.handle_order_item_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inventory_record RECORD;
  v_fulfillment_branch_id UUID;
BEGIN
  -- Get the fulfillment branch from the order (or use first available branch with stock)
  SELECT o.fulfillment_branch_id INTO v_fulfillment_branch_id
  FROM orders o
  WHERE o.id = NEW.order_id;

  -- If no specific branch, find one with available stock
  IF v_fulfillment_branch_id IS NULL THEN
    SELECT i.branch_id INTO v_fulfillment_branch_id
    FROM inventory i
    WHERE i.product_id = NEW.product_id
      AND i.quantity_on_hand >= NEW.quantity
    ORDER BY i.quantity_on_hand DESC
    LIMIT 1;
  END IF;

  -- If we found a branch with stock, deduct it
  IF v_fulfillment_branch_id IS NOT NULL THEN
    -- Get current inventory
    SELECT * INTO v_inventory_record
    FROM inventory
    WHERE product_id = NEW.product_id
      AND branch_id = v_fulfillment_branch_id
    FOR UPDATE;

    IF v_inventory_record IS NOT NULL AND v_inventory_record.quantity_on_hand >= NEW.quantity THEN
      -- Update inventory
      UPDATE inventory
      SET quantity_on_hand = quantity_on_hand - NEW.quantity,
          updated_at = NOW()
      WHERE id = v_inventory_record.id;

      -- Log the transaction
      INSERT INTO inventory_transactions (
        product_id,
        branch_id,
        transaction_type,
        quantity_change,
        quantity_before,
        quantity_after,
        reference_type,
        reference_id,
        performed_by,
        notes
      ) VALUES (
        NEW.product_id,
        v_fulfillment_branch_id,
        'sale',
        -NEW.quantity,
        v_inventory_record.quantity_on_hand,
        v_inventory_record.quantity_on_hand - NEW.quantity,
        'order_item',
        NEW.id,
        (SELECT user_id FROM orders WHERE id = NEW.order_id),
        'Automatic deduction from order'
      );

      -- Update the order with the fulfillment branch if not set
      IF (SELECT fulfillment_branch_id FROM orders WHERE id = NEW.order_id) IS NULL THEN
        UPDATE orders
        SET fulfillment_branch_id = v_fulfillment_branch_id
        WHERE id = NEW.order_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Function to return inventory when order is cancelled
CREATE OR REPLACE FUNCTION public.handle_order_cancelled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_inventory_record RECORD;
BEGIN
  -- Only process if status changed to 'cancelled'
  IF NEW.order_status = 'cancelled' AND OLD.order_status != 'cancelled' THEN
    -- Loop through all order items
    FOR v_item IN 
      SELECT * FROM order_items WHERE order_id = NEW.id
    LOOP
      -- Get current inventory for this product at the fulfillment branch
      SELECT * INTO v_inventory_record
      FROM inventory
      WHERE product_id = v_item.product_id
        AND branch_id = COALESCE(NEW.fulfillment_branch_id, (
          SELECT branch_id FROM inventory WHERE product_id = v_item.product_id LIMIT 1
        ))
      FOR UPDATE;

      IF v_inventory_record IS NOT NULL THEN
        -- Return stock to inventory
        UPDATE inventory
        SET quantity_on_hand = quantity_on_hand + v_item.quantity,
            updated_at = NOW()
        WHERE id = v_inventory_record.id;

        -- Log the return transaction
        INSERT INTO inventory_transactions (
          product_id,
          branch_id,
          transaction_type,
          quantity_change,
          quantity_before,
          quantity_after,
          reference_type,
          reference_id,
          performed_by,
          notes
        ) VALUES (
          v_item.product_id,
          v_inventory_record.branch_id,
          'return_in',
          v_item.quantity,
          v_inventory_record.quantity_on_hand,
          v_inventory_record.quantity_on_hand + v_item.quantity,
          'order',
          NEW.id,
          COALESCE(auth.uid(), NEW.user_id),
          'Stock returned due to order cancellation'
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for order item creation (stock deduction)
DROP TRIGGER IF EXISTS trigger_order_item_stock_deduction ON order_items;
CREATE TRIGGER trigger_order_item_stock_deduction
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_item_created();

-- Create trigger for order cancellation (stock return)
DROP TRIGGER IF EXISTS trigger_order_cancelled_stock_return ON orders;
CREATE TRIGGER trigger_order_cancelled_stock_return
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.order_status = 'cancelled' AND OLD.order_status IS DISTINCT FROM 'cancelled')
  EXECUTE FUNCTION handle_order_cancelled();