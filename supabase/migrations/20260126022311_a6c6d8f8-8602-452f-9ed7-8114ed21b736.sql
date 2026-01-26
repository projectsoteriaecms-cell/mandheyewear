-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('customer', 'branch_staff', 'branch_manager', 'super_admin');

-- Create branch_type enum
CREATE TYPE public.branch_type AS ENUM ('physical_store', 'online_warehouse');

-- Create brand_line enum
CREATE TYPE public.brand_line AS ENUM ('soteria_medical', 'm_and_h_fashion');

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'shipped', 'delivered', 'cancelled');

-- Create payment_status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Create appointment_status enum
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');

-- =====================
-- USER ROLES TABLE (Security-First)
-- =====================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES TABLE
-- =====================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  email TEXT,
  avatar_url TEXT,
  face_dimensions JSONB DEFAULT '{}',
  frame_preferences JSONB DEFAULT '{}',
  prescription_on_file BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================
-- BRANCHES TABLE
-- =====================
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type branch_type NOT NULL DEFAULT 'physical_store',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  hours_weekdays TEXT DEFAULT '9:00am – 6:00pm',
  hours_saturday TEXT DEFAULT '9:00am – 6:00pm',
  hours_sunday TEXT DEFAULT 'Closed',
  is_head_office BOOLEAN DEFAULT FALSE,
  is_mh_location BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- =====================
-- CATEGORIES TABLE
-- =====================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id),
  brand_line brand_line NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- =====================
-- PRODUCTS TABLE
-- =====================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  brand_line brand_line NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  additional_images TEXT[] DEFAULT '{}',
  is_prescription_compatible BOOLEAN DEFAULT TRUE,
  gender TEXT DEFAULT 'unisex',
  style TEXT,
  material TEXT,
  color TEXT,
  frame_width TEXT,
  bridge_size TEXT,
  temple_length TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- =====================
-- INVENTORY TABLE
-- =====================
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (product_id, branch_id)
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- =====================
-- PRESCRIPTIONS TABLE
-- =====================
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  rx_data JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  document_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- =====================
-- APPOINTMENTS TABLE
-- =====================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID,
  service_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- =====================
-- CART ITEMS TABLE
-- =====================
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  prescription_data JSONB,
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '15 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- =====================
-- ORDERS TABLE
-- =====================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fulfillment_branch_id UUID REFERENCES public.branches(id),
  order_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  order_status order_status NOT NULL DEFAULT 'pending',
  shipping_address JSONB,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =====================
-- ORDER ITEMS TABLE
-- =====================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  prescription_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =====================
-- WISHLIST TABLE
-- =====================
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- =====================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECK
-- =====================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =====================
-- RLS POLICIES
-- =====================

-- User Roles: Users can read their own roles, admins can manage all
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Profiles: Users manage their own, staff can view all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Branches: Public read, admin write
CREATE POLICY "Anyone can view active branches" ON public.branches
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Super admins can manage branches" ON public.branches
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Categories: Public read, admin write
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Super admins can manage categories" ON public.categories
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Products: Public read, admin write
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Super admins can manage products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Inventory: Staff can view, managers can update
CREATE POLICY "Staff can view inventory" ON public.inventory
  FOR SELECT USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Managers can manage inventory" ON public.inventory
  FOR ALL USING (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Public read for inventory (to show stock status)
CREATE POLICY "Anyone can view inventory levels" ON public.inventory
  FOR SELECT USING (TRUE);

-- Prescriptions: Users manage their own, staff can view
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all prescriptions" ON public.prescriptions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Appointments: Users manage their own, staff can view/update
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all appointments" ON public.appointments
  FOR SELECT USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Staff can update appointments" ON public.appointments
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Cart Items: Users manage their own
CREATE POLICY "Users can manage own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Orders: Users view their own, staff can view/update
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all orders" ON public.orders
  FOR SELECT USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Staff can update orders" ON public.orders
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Order Items: Same as orders
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all order items" ON public.order_items
  FOR SELECT USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Wishlist: Users manage their own
CREATE POLICY "Users can manage own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- TRIGGERS
-- =====================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();