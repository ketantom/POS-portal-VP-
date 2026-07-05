export type UserRole = 'super_admin' | 'manager' | 'cashier';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku_code: string;
  price: number;
  unit: 'bottle' | 'ml' | 'L' | 'pack' | 'box' | 'piece';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  discount_enabled: boolean;
  discount_amount: number;
  gst_enabled: boolean;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  payment_method: string;
  status: 'draft' | 'completed' | 'cancelled';
  notes: string;
  created_by: string;
  created_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface BankingDetails {
  id: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
  account_holder_name: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}
