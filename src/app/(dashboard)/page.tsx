'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product, CartItem, Invoice, InvoiceItem, PaymentMethod } from '@/lib/types';
import { useToast } from '@/components/Toast';
import ProductCard from '@/components/ProductCard';
import CartPanel, { InvoiceData } from '@/components/CartPanel';
import Receipt from '@/components/Receipt';
import InvoiceHistory from '@/components/InvoiceHistory';

export default function POSDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentInvoiceItems, setCurrentInvoiceItems] = useState<InvoiceItem[]>([]);

  const { addToast } = useToast();
  const supabase = createClient();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, pmRes, invRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('name'),
        supabase.from('payment_methods').select('*').eq('is_active', true).order('name'),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (pmRes.data) setPaymentMethods(pmRes.data as PaymentMethod[]);
      if (invRes.data) setRecentInvoices(invRes.data as Invoice[]);
    } catch (error) {
      console.error('Failed to load POS data', error);
      addToast('Failed to load POS data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lowerQ = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQ) || 
      p.sku_code.toLowerCase().includes(lowerQ)
    );
  }, [products, searchQuery]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          addToast(`Maximum stock reached for ${product.name}`, 'warning');
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
    }
  };

  const handleGenerateInvoice = async (data: InvoiceData) => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Generate Invoice Number via RPC
      const { data: invNumber, error: rpcError } = await supabase.rpc('generate_invoice_number');
      if (rpcError) throw rpcError;
      
      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const taxableAmount = Math.max(0, subtotal - data.discountAmount);
      const gstAmount = data.gstEnabled ? (taxableAmount * data.gstRate) / 100 : 0;
      const totalAmount = taxableAmount + gstAmount;

      // 2. Insert Invoice
      const newInvoice = {
        invoice_number: invNumber,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        subtotal,
        discount_enabled: data.discountEnabled,
        discount_amount: data.discountAmount,
        gst_enabled: data.gstEnabled,
        gst_rate: data.gstRate,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        payment_method: data.paymentMethod,
        status: 'completed',
        notes: '',
        created_by: user.id
      };

      const { data: insertedInvoice, error: invError } = await supabase
        .from('invoices')
        .insert(newInvoice)
        .select()
        .single();

      if (invError) throw invError;

      // 3. Insert Invoice Items
      const invoiceItems = cart.map(item => ({
        invoice_id: insertedInvoice.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItems);
      if (itemsError) throw itemsError;

      // 4. Update Stock Quantities (Simplified client-side loop for now)
      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock_quantity: item.product.stock_quantity - item.quantity })
          .eq('id', item.product.id);
      }

      addToast('Invoice generated successfully!', 'success');
      
      // Success State
      setCurrentInvoice(insertedInvoice as Invoice);
      setCurrentInvoiceItems(invoiceItems as any as InvoiceItem[]);
      setShowReceipt(true);
      setCart([]);
      loadData(); // Refresh products & history
      
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      addToast(error.message || 'Failed to generate invoice', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id);
        
      if (error) throw error;
      
      setCurrentInvoice(invoice);
      setCurrentInvoiceItems(data as InvoiceItem[]);
      setShowReceipt(true);
    } catch (error) {
      addToast('Failed to load invoice details', 'error');
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Left Panel - Products */}
      <div className="w-full md:w-[60%] flex flex-col h-full overflow-hidden">
        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-[var(--text-light)]">🔍</span>
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              className="input pl-10 w-full bg-[var(--bg-white)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[var(--text-light)] hover:text-[var(--text-dark)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-20">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton skeleton-card"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAdd={handleAddToCart} 
                />
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-[var(--border)] pt-4">
            <InvoiceHistory 
              invoices={recentInvoices} 
              onViewInvoice={handleViewInvoice}
              isLoading={isLoading}
              onRefresh={loadData}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-full md:w-[40%] h-full">
        <CartPanel 
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onGenerateInvoice={handleGenerateInvoice}
          paymentMethods={paymentMethods}
          isLoading={isGenerating}
        />
      </div>

      {/* Receipt Modal */}
      {showReceipt && currentInvoice && (
        <div className="modal-overlay">
          <div className="relative bg-transparent max-h-[95vh] overflow-y-auto w-full flex flex-col items-center p-4 animate-scale-in">
            <button 
              onClick={() => setShowReceipt(false)}
              className="absolute top-2 right-2 md:top-6 md:right-6 bg-white rounded-full p-2 text-gray-500 hover:text-red-500 shadow-lg z-50 hide-on-print"
            >
              ✕
            </button>
            <Receipt invoice={currentInvoice} items={currentInvoiceItems} />
          </div>
        </div>
      )}
    </div>
  );
}
