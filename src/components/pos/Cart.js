'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { supabase } from '@/lib/supabase/client';
import { Trash2, Minus, Plus } from 'lucide-react';

export default function Cart() {
  const { 
    items, 
    discount, 
    setDiscount,
    isTaxEnabled,
    setIsTaxEnabled,
    isDiscountEnabled,
    setIsDiscountEnabled,
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotals 
  } = useCartStore();
  
  const { profile } = useAuthStore();
  const { subtotal, tax, discount: appliedDiscount, total } = getTotals();
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [receivingAccount, setReceivingAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);

  useEffect(() => {
    // Fetch accounts when UPI is selected
    if (paymentMethod === 'UPI/QR') {
      fetchAccounts();
    } else {
      setReceivingAccount('');
    }
  }, [paymentMethod]);

  async function fetchAccounts() {
    // Try to fetch from accounts table. If it doesn't exist yet, we'll gracefully fallback
    const { data, error } = await supabase.from('accounts').select('*').order('name');
    if (!error && data) {
      setAvailableAccounts(data);
    } else {
      // Fallback dummy data if table not created yet
      setAvailableAccounts([{ id: 1, name: 'HDFC Current' }, { id: 2, name: 'PhonePe QR' }]);
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0 || !profile) return;
    
    if (paymentMethod === 'UPI/QR' && !receivingAccount) {
      alert('Please select a receiving account for UPI/QR payment.');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          total_amount: total,
          payment_method: paymentMethod,
          receiving_account: paymentMethod !== 'Cash' ? receivingAccount : null,
          cashier_id: profile.id
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const saleItems = items.map(item => ({
        sale_id: sale.id,
        sku: item.sku,
        name: item.name,
        price: item.price,
        quantity: item.qty
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      alert('Transaction Completed Successfully!');
      clearCart();
      setPaymentMethod('Cash');
      setReceivingAccount('');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to process checkout: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Current Order</h3>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-xs font-bold text-red-600 hover:text-red-700 transition">Clear</button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl block mb-3 opacity-50">🛒</span>
            <p className="text-sm font-medium">Cart is empty</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map(item => (
              <div key={item.sku} className="flex flex-col p-3 rounded-lg hover:bg-gray-50 transition group border border-transparent hover:border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <h5 className="text-sm font-bold text-gray-800 leading-tight">{item.name}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">₹{Number(item.price).toFixed(2)}</p>
                  </div>
                  <span className="font-extrabold text-gray-800 text-sm">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-gray-100 rounded-md p-1 border border-gray-200">
                    <button 
                      onClick={() => updateQuantity(item.sku, item.qty - 1)}
                      className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-red-600 border border-gray-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-gray-800">{item.qty}</span>
                    <button 
                      onClick={() => updateQuantity(item.sku, item.qty + 1)}
                      className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-green-600 border border-gray-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.sku)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
        
        {/* Totals Section with Checkboxes */}
        <div className="space-y-2 border-b border-gray-200 pb-4">
          <div className="flex justify-between text-sm text-gray-600 items-center">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
          </div>
          
          {/* Tax Checkbox */}
          <div className="flex justify-between text-sm text-gray-600 items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isTaxEnabled}
                onChange={(e) => setIsTaxEnabled(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              Tax (18% GST)
            </label>
            <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
          </div>
          
          {/* Discount Checkbox & Input */}
          <div className="flex justify-between text-sm text-gray-600 items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isDiscountEnabled}
                onChange={(e) => setIsDiscountEnabled(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              Discount (₹)
            </label>
            <input 
              type="number" 
              min="0"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              disabled={!isDiscountEnabled}
              placeholder="0.00"
              className="w-24 text-right bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-medium text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-2xl font-extrabold text-gray-900">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</label>
          <div className="flex gap-2">
            {['Cash', 'Card', 'UPI/QR'].map(method => (
              <button
                key={method}
                onClick={() => {
                  setPaymentMethod(method);
                  setReceivingAccount('');
                }}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition border ${
                  paymentMethod === method
                    ? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Conditional Accounts Dropdown for UPI/QR */}
          {paymentMethod === 'UPI/QR' && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
              <label className="text-xs font-medium text-gray-700">Select Receiving Account *</label>
              <select
                value={receivingAccount}
                onChange={(e) => setReceivingAccount(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-gray-800"
              >
                <option value="" disabled>-- Choose Account --</option>
                {availableAccounts.map(acc => (
                  <option key={acc.name} value={acc.name}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}

          {paymentMethod === 'Card' && (
            <input
              type="text"
              placeholder="Card Machine / Ref No. (Optional)"
              value={receivingAccount}
              onChange={(e) => setReceivingAccount(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-gray-800"
            />
          )}
        </div>
        
        <button 
          onClick={handleCheckout}
          disabled={items.length === 0 || isProcessing || (paymentMethod === 'UPI/QR' && !receivingAccount)}
          className="w-full py-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
        >
          {isProcessing ? 'Processing...' : 'Complete Checkout'}
        </button>
      </div>
    </div>
  );
}
