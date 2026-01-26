-- Function to increase inventory when purchase order is received
CREATE OR REPLACE FUNCTION public.handle_purchase_order_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_inventory_record RECORD;
  v_quantity_to_add INTEGER;
BEGIN
  -- Only process if status changed to 'received' or 'partially_received'
  IF (NEW.status IN ('received', 'partially_received')) 
     AND (OLD.status NOT IN ('received', 'partially_received')) THEN
    
    -- Loop through all purchase order items
    FOR v_item IN 
      SELECT * FROM purchase_order_items WHERE purchase_order_id = NEW.id
    LOOP
      -- Calculate quantity to add (use quantity_received if set, otherwise quantity_ordered)
      v_quantity_to_add := COALESCE(v_item.quantity_received, v_item.quantity_ordered);
      
      -- Skip if nothing to add
      IF v_quantity_to_add <= 0 THEN
        CONTINUE;
      END IF;

      -- Check if inventory record exists for this product/branch
      SELECT * INTO v_inventory_record
      FROM inventory
      WHERE product_id = v_item.product_id
        AND branch_id = NEW.branch_id
      FOR UPDATE;

      IF v_inventory_record IS NOT NULL THEN
        -- Update existing inventory
        UPDATE inventory
        SET quantity_on_hand = quantity_on_hand + v_quantity_to_add,
            last_received_date = CURRENT_DATE,
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
          v_item.product_id,
          NEW.branch_id,
          'purchase_received',
          v_quantity_to_add,
          v_inventory_record.quantity_on_hand,
          v_inventory_record.quantity_on_hand + v_quantity_to_add,
          'purchase_order',
          NEW.id,
          COALESCE(auth.uid(), NEW.created_by),
          'Stock received from PO: ' || NEW.order_number
        );
      ELSE
        -- Create new inventory record
        INSERT INTO inventory (
          product_id,
          branch_id,
          quantity_on_hand,
          quantity_reserved,
          last_received_date
        ) VALUES (
          v_item.product_id,
          NEW.branch_id,
          v_quantity_to_add,
          0,
          CURRENT_DATE
        );

        -- Log the transaction for new inventory
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
          NEW.branch_id,
          'purchase_received',
          v_quantity_to_add,
          0,
          v_quantity_to_add,
          'purchase_order',
          NEW.id,
          COALESCE(auth.uid(), NEW.created_by),
          'Initial stock from PO: ' || NEW.order_number
        );
      END IF;
    END LOOP;

    -- Update received_date if fully received
    IF NEW.status = 'received' AND NEW.received_date IS NULL THEN
      NEW.received_date := CURRENT_DATE;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for purchase order receiving
DROP TRIGGER IF EXISTS trigger_purchase_order_received ON purchase_orders;
CREATE TRIGGER trigger_purchase_order_received
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  WHEN (NEW.status IN ('received', 'partially_received') 
        AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_purchase_order_received();