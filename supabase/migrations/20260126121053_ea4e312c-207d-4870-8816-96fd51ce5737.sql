-- Function to handle stock transfer status changes
CREATE OR REPLACE FUNCTION public.handle_stock_transfer_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_inventory_record RECORD;
  v_quantity_to_move INTEGER;
BEGIN
  -- Handle 'in_transit' - deduct from source branch
  IF NEW.status = 'in_transit' AND OLD.status = 'pending' THEN
    FOR v_item IN 
      SELECT * FROM stock_transfer_items WHERE stock_transfer_id = NEW.id
    LOOP
      v_quantity_to_move := COALESCE(v_item.quantity_sent, v_item.quantity_requested);
      
      IF v_quantity_to_move <= 0 THEN
        CONTINUE;
      END IF;

      -- Get source branch inventory
      SELECT * INTO v_inventory_record
      FROM inventory
      WHERE product_id = v_item.product_id
        AND branch_id = NEW.from_branch_id
      FOR UPDATE;

      IF v_inventory_record IS NOT NULL THEN
        -- Deduct from source branch
        UPDATE inventory
        SET quantity_on_hand = quantity_on_hand - v_quantity_to_move,
            updated_at = NOW()
        WHERE id = v_inventory_record.id;

        -- Log transfer out
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
          NEW.from_branch_id,
          'transfer_out',
          -v_quantity_to_move,
          v_inventory_record.quantity_on_hand,
          v_inventory_record.quantity_on_hand - v_quantity_to_move,
          'stock_transfer',
          NEW.id,
          COALESCE(auth.uid(), NEW.initiated_by),
          'Stock shipped - Transfer: ' || NEW.transfer_number
        );

        -- Update quantity_sent on the item
        UPDATE stock_transfer_items
        SET quantity_sent = v_quantity_to_move
        WHERE id = v_item.id;
      END IF;
    END LOOP;

    -- Set shipped timestamp
    NEW.shipped_at := NOW();
  END IF;

  -- Handle 'received' - add to destination branch
  IF NEW.status = 'received' AND OLD.status = 'in_transit' THEN
    FOR v_item IN 
      SELECT * FROM stock_transfer_items WHERE stock_transfer_id = NEW.id
    LOOP
      v_quantity_to_move := COALESCE(v_item.quantity_received, v_item.quantity_sent, v_item.quantity_requested);
      
      IF v_quantity_to_move <= 0 THEN
        CONTINUE;
      END IF;

      -- Get or create destination branch inventory
      SELECT * INTO v_inventory_record
      FROM inventory
      WHERE product_id = v_item.product_id
        AND branch_id = NEW.to_branch_id
      FOR UPDATE;

      IF v_inventory_record IS NOT NULL THEN
        -- Add to existing inventory
        UPDATE inventory
        SET quantity_on_hand = quantity_on_hand + v_quantity_to_move,
            last_received_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = v_inventory_record.id;

        -- Log transfer in
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
          NEW.to_branch_id,
          'transfer_in',
          v_quantity_to_move,
          v_inventory_record.quantity_on_hand,
          v_inventory_record.quantity_on_hand + v_quantity_to_move,
          'stock_transfer',
          NEW.id,
          COALESCE(auth.uid(), NEW.received_by, NEW.initiated_by),
          'Stock received - Transfer: ' || NEW.transfer_number
        );
      ELSE
        -- Create new inventory record at destination
        INSERT INTO inventory (
          product_id,
          branch_id,
          quantity_on_hand,
          quantity_reserved,
          last_received_date
        ) VALUES (
          v_item.product_id,
          NEW.to_branch_id,
          v_quantity_to_move,
          0,
          CURRENT_DATE
        );

        -- Log transfer in for new inventory
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
          NEW.to_branch_id,
          'transfer_in',
          v_quantity_to_move,
          0,
          v_quantity_to_move,
          'stock_transfer',
          NEW.id,
          COALESCE(auth.uid(), NEW.received_by, NEW.initiated_by),
          'Initial stock via transfer: ' || NEW.transfer_number
        );
      END IF;

      -- Update quantity_received on the item
      UPDATE stock_transfer_items
      SET quantity_received = v_quantity_to_move
      WHERE id = v_item.id;
    END LOOP;

    -- Set completed timestamp
    NEW.completed_at := NOW();
  END IF;

  -- Handle 'cancelled' - return stock to source if was in transit
  IF NEW.status = 'cancelled' AND OLD.status = 'in_transit' THEN
    FOR v_item IN 
      SELECT * FROM stock_transfer_items WHERE stock_transfer_id = NEW.id
    LOOP
      v_quantity_to_move := COALESCE(v_item.quantity_sent, 0);
      
      IF v_quantity_to_move <= 0 THEN
        CONTINUE;
      END IF;

      -- Get source branch inventory
      SELECT * INTO v_inventory_record
      FROM inventory
      WHERE product_id = v_item.product_id
        AND branch_id = NEW.from_branch_id
      FOR UPDATE;

      IF v_inventory_record IS NOT NULL THEN
        -- Return to source branch
        UPDATE inventory
        SET quantity_on_hand = quantity_on_hand + v_quantity_to_move,
            updated_at = NOW()
        WHERE id = v_inventory_record.id;

        -- Log return
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
          NEW.from_branch_id,
          'return_in',
          v_quantity_to_move,
          v_inventory_record.quantity_on_hand,
          v_inventory_record.quantity_on_hand + v_quantity_to_move,
          'stock_transfer',
          NEW.id,
          COALESCE(auth.uid(), NEW.initiated_by),
          'Transfer cancelled - stock returned: ' || NEW.transfer_number
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for stock transfer status changes
DROP TRIGGER IF EXISTS trigger_stock_transfer_status_change ON stock_transfers;
CREATE TRIGGER trigger_stock_transfer_status_change
  BEFORE UPDATE ON stock_transfers
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_stock_transfer_status_change();