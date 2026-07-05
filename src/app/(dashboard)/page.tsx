'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product, CartItem, Invoice, InvoiceItem, PaymentMethod } from '@/lib/types';
import { useToast } from '@/components/Toast';
import ProductCard from '@/components/ProductCard';
import CartPanel, { InvoiceData } from '@/components/CartPanel';
import Receipt from '@/components/Receipt';

export default function POSDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
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
      const [productsRes, pmRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('name'),
        supabase.from('payment_methods').select('*').eq('is_active', true).order('name')
      ]);

      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (pmRes.data) setPaymentMethods(pmRes.data as PaymentMethod[]);
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

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Uncategorized'));
    return ['All', ...Array.from(cats)].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory !== 'All') {
      filtered = filtered.filter(p => (p.category || 'Uncategorized') === activeCategory);
    }
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.sku_code.toLowerCase().includes(lowerQ)
      );
    }
    return filtered;
  }, [products, searchQuery, activeCategory]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
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
      // Removed stock decrement as requested

      // Success State
      setCurrentInvoice(insertedInvoice as Invoice);
      setCurrentInvoiceItems(invoiceItems as any as InvoiceItem[]);
      setShowReceipt(true);
      addToast('Invoice generated successfully!', 'success');
      
      // Refresh Data
      loadData();
      handleClearCart();
      
    } catch (error: any) {
      addToast(error.message || 'Failed to generate invoice', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      // Delete items first (if no cascade)
      await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
      // Delete invoice
      const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
      if (error) throw error;
      
      addToast('Invoice deleted successfully', 'success');
      setShowReceipt(false);
      loadData();
    } catch (error: any) {
      addToast(error.message || 'Failed to delete invoice', 'error');
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
    <div className="flex-1 px-4 sm:px-8 pb-8 flex flex-col md:flex-row gap-8 h-full overflow-hidden">
      
      {/* Left Panel - Products */}
      <div className="w-full md:w-[65%] flex flex-col h-full overflow-hidden">
        <div className="mb-6 relative z-20 flex flex-col gap-4">
          <div className="relative w-full max-w-md group">
            <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              className="w-full bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-sm focus:bg-white focus:border-slate-300 focus:shadow-md rounded-2xl pl-12 pr-12 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-900 transition-colors bg-slate-100 rounded-full p-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/60'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-32 custom-scrollbar relative z-10">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-slate-200/50 animate-pulse rounded-3xl h-[180px]"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               <p className="font-medium text-sm tracking-wide">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-12">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAdd={handleAddToCart} 
                />
              ))}
            </div>
          )}

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
        <Receipt 
          invoice={currentInvoice} 
          items={currentInvoiceItems} 
          onClose={() => setShowReceipt(false)} 
          onDelete={handleDeleteInvoice}
        />
      )}
    </div>
  );
}
