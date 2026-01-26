-- Create new enums for inventory management
CREATE TYPE public.item_type AS ENUM ('frames', 'lenses', 'contact_lenses', 'solutions', 'medications', 'accessories', 'other');
CREATE TYPE public.purchase_order_status AS ENUM ('draft', 'submitted', 'approved', 'partially_received', 'received', 'cancelled');
CREATE TYPE public.transfer_status AS ENUM ('pending', 'in_transit', 'received', 'cancelled');
CREATE TYPE public.adjustment_type AS ENUM ('count_correction', 'damage', 'expiry', 'write_off', 'other');
CREATE TYPE public.transaction_type AS ENUM ('purchase_received', 'sale', 'return_in', 'return_out', 'transfer_in', 'transfer_out', 'adjustment', 'write_off', 'initial_stock');

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  payment_terms TEXT,
  tax_id TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES public.suppliers(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id) NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  received_date DATE,
  status public.purchase_order_status DEFAULT 'draft' NOT NULL,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  notes TEXT,
  created_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
  quantity_received INTEGER DEFAULT 0,
  unit_cost NUMERIC(12,2) NOT NULL,
  total_cost NUMERIC(12,2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create stock_transfers table
CREATE TABLE public.stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number TEXT NOT NULL UNIQUE,
  from_branch_id UUID REFERENCES public.branches(id) NOT NULL,
  to_branch_id UUID REFERENCES public.branches(id) NOT NULL,
  status public.transfer_status DEFAULT 'pending' NOT NULL,
  initiated_by UUID NOT NULL,
  received_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  shipped_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT different_branches CHECK (from_branch_id != to_branch_id)
);

-- Create stock_transfer_items table
CREATE TABLE public.stock_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_transfer_id UUID REFERENCES public.stock_transfers(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity_requested INTEGER NOT NULL CHECK (quantity_requested > 0),
  quantity_sent INTEGER DEFAULT 0,
  quantity_received INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create stock_adjustments table
CREATE TABLE public.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  adjustment_type public.adjustment_type NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  quantity_change INTEGER GENERATED ALWAYS AS (quantity_after - quantity_before) STORED,
  reason TEXT NOT NULL,
  performed_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create inventory_transactions table (audit trail)
CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id) NOT NULL,
  transaction_type public.transaction_type NOT NULL,
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reference_type TEXT, -- 'purchase_order', 'order', 'transfer', 'adjustment'
  reference_id UUID,
  notes TEXT,
  performed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Extend products table with inventory management fields
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id),
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS item_type public.item_type DEFAULT 'frames';

-- Extend inventory table
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS last_stock_count_date DATE,
ADD COLUMN IF NOT EXISTS last_received_date DATE,
ADD COLUMN IF NOT EXISTS bin_location TEXT;

-- Create function to generate PO numbers
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for PO number generation
CREATE TRIGGER generate_po_number_trigger
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_po_number();

-- Create function to generate transfer numbers
CREATE OR REPLACE FUNCTION public.generate_transfer_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.transfer_number := 'TRF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for transfer number generation
CREATE TRIGGER generate_transfer_number_trigger
  BEFORE INSERT ON public.stock_transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_transfer_number();

-- Create updated_at triggers for new tables
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all new tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suppliers
CREATE POLICY "Staff can view active suppliers"
  ON public.suppliers FOR SELECT
  USING (is_active = true AND (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  ));

CREATE POLICY "Managers can manage suppliers"
  ON public.suppliers FOR ALL
  USING (
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for purchase_orders
CREATE POLICY "Staff can view purchase orders"
  ON public.purchase_orders FOR SELECT
  USING (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Staff can create draft purchase orders"
  ON public.purchase_orders FOR INSERT
  WITH CHECK (
    status = 'draft' AND (
      has_role(auth.uid(), 'branch_staff') OR 
      has_role(auth.uid(), 'branch_manager') OR 
      has_role(auth.uid(), 'super_admin')
    )
  );

CREATE POLICY "Staff can update their draft POs"
  ON public.purchase_orders FOR UPDATE
  USING (
    (status = 'draft' AND created_by = auth.uid()) OR
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Managers can delete draft POs"
  ON public.purchase_orders FOR DELETE
  USING (
    status = 'draft' AND (
      has_role(auth.uid(), 'branch_manager') OR 
      has_role(auth.uid(), 'super_admin')
    )
  );

-- RLS Policies for purchase_order_items
CREATE POLICY "Staff can view PO items"
  ON public.purchase_order_items FOR SELECT
  USING (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Staff can manage PO items for draft POs"
  ON public.purchase_order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po 
      WHERE po.id = purchase_order_items.purchase_order_id 
      AND (
        (po.status = 'draft' AND po.created_by = auth.uid()) OR
        has_role(auth.uid(), 'branch_manager') OR 
        has_role(auth.uid(), 'super_admin')
      )
    )
  );

-- RLS Policies for stock_transfers
CREATE POLICY "Staff can view transfers"
  ON public.stock_transfers FOR SELECT
  USING (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Staff can create transfers"
  ON public.stock_transfers FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Managers can update transfers"
  ON public.stock_transfers FOR UPDATE
  USING (
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for stock_transfer_items
CREATE POLICY "Staff can view transfer items"
  ON public.stock_transfer_items FOR SELECT
  USING (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Staff can manage transfer items"
  ON public.stock_transfer_items FOR ALL
  USING (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for stock_adjustments
CREATE POLICY "Staff can view adjustments"
  ON public.stock_adjustments FOR SELECT
  USING (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Staff can create adjustments"
  ON public.stock_adjustments FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Managers can update adjustments"
  ON public.stock_adjustments FOR UPDATE
  USING (
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for inventory_transactions (read-only audit log)
CREATE POLICY "Staff can view transactions"
  ON public.inventory_transactions FOR SELECT
  USING (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "System can insert transactions"
  ON public.inventory_transactions FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'branch_staff') OR 
    has_role(auth.uid(), 'branch_manager') OR 
    has_role(auth.uid(), 'super_admin')
  );

-- Create indexes for performance
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_branch ON public.purchase_orders(branch_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_order_items_po ON public.purchase_order_items(purchase_order_id);
CREATE INDEX idx_stock_transfers_from ON public.stock_transfers(from_branch_id);
CREATE INDEX idx_stock_transfers_to ON public.stock_transfers(to_branch_id);
CREATE INDEX idx_stock_transfers_status ON public.stock_transfers(status);
CREATE INDEX idx_inventory_transactions_product ON public.inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_branch ON public.inventory_transactions(branch_id);
CREATE INDEX idx_inventory_transactions_type ON public.inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_created ON public.inventory_transactions(created_at DESC);
CREATE INDEX idx_products_supplier ON public.products(supplier_id);
CREATE INDEX idx_products_item_type ON public.products(item_type);