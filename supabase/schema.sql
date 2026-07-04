-- Supabase POS System Schema
-- Run this in your Supabase SQL Editor

-- 1. Create Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'Cashier' CHECK (role IN ('Admin', 'Cashier')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Products Table
CREATE TABLE public.products (
  sku TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Sales Table (Transactions)
CREATE TABLE public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'UPI')),
  receiving_account TEXT,
  cashier_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Sale Items Table (Line items for each sale)
CREATE TABLE public.sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  sku TEXT REFERENCES public.products(sku) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Create a function to check if the current user is an Approved Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'Admin' 
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if the current user is an Approved Cashier or Admin
CREATE OR REPLACE FUNCTION public.is_approved_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Profiles Policies
-- 1. Anyone authenticated can read profiles
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Only Admins can update profiles (to approve/change roles)
CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE USING (public.is_admin());

-- Note: Profile insertion will be handled securely via a database trigger on auth.users creation.

-- Trigger for automatically creating a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role, status)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    -- Make the first user an Admin automatically, others Cashier
    CASE WHEN (SELECT count(*) FROM public.profiles) = 0 THEN 'Admin' ELSE 'Cashier' END,
    CASE WHEN (SELECT count(*) FROM public.profiles) = 0 THEN 'approved' ELSE 'pending' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Products Policies
-- 1. All approved staff can view products
CREATE POLICY "Approved staff can view products" 
ON public.products FOR SELECT USING (public.is_approved_staff());

-- 2. Only Admins can insert/update/delete products
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());


-- Sales Policies
-- 1. All approved staff can view sales (for history/reporting)
CREATE POLICY "Approved staff can view sales" 
ON public.sales FOR SELECT USING (public.is_approved_staff());

-- 2. All approved staff can create sales (billing)
CREATE POLICY "Approved staff can insert sales" 
ON public.sales FOR INSERT WITH CHECK (public.is_approved_staff());

-- 3. Only Admins can update/delete sales
CREATE POLICY "Admins can update sales" ON public.sales FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete sales" ON public.sales FOR DELETE USING (public.is_admin());


-- Sale Items Policies
-- 1. All approved staff can view sale items
CREATE POLICY "Approved staff can view sale items" 
ON public.sale_items FOR SELECT USING (public.is_approved_staff());

-- 2. All approved staff can insert sale items (billing)
CREATE POLICY "Approved staff can insert sale items" 
ON public.sale_items FOR INSERT WITH CHECK (public.is_approved_staff());

-- 3. Only Admins can update/delete sale items
CREATE POLICY "Admins can update sale items" ON public.sale_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete sale items" ON public.sale_items FOR DELETE USING (public.is_admin());
