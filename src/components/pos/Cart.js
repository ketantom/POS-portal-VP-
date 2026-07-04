'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { supabase } from '@/lib/supabase/client';
import { Minus, Receipt as ReceiptIcon, Printer } from 'lucide-react';
import Receipt from './Receipt';

export default function Cart() {
  const { 
    items, 
    discount, 
    setDiscount,
    isTaxEnabled,
    setIsTaxEnabled,
    updateQuantity, 
    clearCart, 
    getTotals 
  } = useCartStore();
  
  const { profile } = useAuthStore();
  const { subtotal, tax, discount: appliedDiscount, total } = getTotals();
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [receivingAccount, setReceivingAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);

  // Print Dialog State
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    if (paymentMethod === 'UPI/QR') {
      fetchAccounts();
    } else {
      setReceivingAccount('');
    }
  }, [paymentMethod]);

  async function fetchAccounts() {
    const { data, error } = await supabase.from('accounts').select('*').order('name');
    if (!error && data) {
      setAvailableAccounts(data);
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

      // Prepare order for printing
      setLastOrder({
        items: items.map(i => ({ name: i.name, quantity: i.qty, price: i.price })),
        subtotal,
        tax,
        discount: appliedDiscount,
        total,
        paymentMethod,
        orderId: sale.id.split('-')[0].toUpperCase()
      });
      setShowPrintDialog(true);

    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to process checkout: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const finishPrint = () => {
    window.print();
    setTimeout(resetCart, 500);
  };

  const skipPrint = () => {
    resetCart();
  };

  const resetCart = () => {
    setShowPrintDialog(false);
    clearCart();
    setPaymentMethod('Cash');
    setReceivingAccount('');
    setLastOrder(null);
  };

  return (
    <div className="w-full md:w-80 lg:w-[350px] flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Current Order</h3>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-xs font-bold text-red-600 hover:text-red-700 transition">Clear</button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 bg-gray-50/30">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl block mb-3 opacity-30">🛒</span>
            <p className="text-sm font-medium">Cart is empty</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map(item => (
              <div key={item.sku} className="flex flex-col p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100 bg-white shadow-sm mb-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <h5 className="text-sm font-bold text-gray-800 leading-tight">{item.name}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">₹{Number(item.price).toFixed(2)}</p>
                  </div>
                  <span className="font-extrabold text-gray-900 text-sm">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-md p-1 border border-gray-200">
                    <button 
                      onClick={() => updateQuantity(item.sku, item.qty - 1)}
                      className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-red-600 border border-gray-200 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-gray-800">{item.qty}</span>
                    <button 
                      onClick={() => updateQuantity(item.sku, item.qty + 1)}
                      className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-red-600 border border-gray-200 transition-colors"
                    >
                      <span className="font-bold leading-none mb-0.5">+</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white p-4 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="space-y-2 text-sm font-medium text-gray-600">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span className="font-bold text-gray-800">₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isTaxEnabled}
                onChange={(e) => setIsTaxEnabled(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <span className="font-bold text-gray-700">GST (5%)</span>
            </label>
            <span className="font-bold text-gray-800">₹{tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
            <span className="font-bold text-gray-700">Discount (₹)</span>
            <input 
              type="number" 
              min="0"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-20 px-2 py-1 text-right border border-gray-300 rounded bg-white focus:outline-none focus:border-red-500 font-bold text-gray-800"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 flex justify-between items-end">
          <span className="text-gray-500 font-bold">Total</span>
          <span className="text-3xl font-black text-gray-900 tracking-tight">₹{total.toFixed(2)}</span>
        </div>

        <div className="space-y-2 pt-2">
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-bold text-gray-800 cursor-pointer"
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI/QR">UPI / QR Code</option>
          </select>
          
          {paymentMethod === 'UPI/QR' && (
            <select 
              value={receivingAccount} 
              onChange={(e) => setReceivingAccount(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-bold text-gray-800 cursor-pointer"
            >
              <option value="">Select Receiving Account</option>
              {availableAccounts.map(acc => (
                <option key={acc.id} value={acc.name}>{acc.name}</option>
              ))}
            </select>
          )}

          <button 
            onClick={handleCheckout}
            disabled={items.length === 0 || isProcessing}
            className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-500/30"
          >
            {isProcessing ? 'Processing...' : 'Charge'}
          </button>
        </div>
      </div>

      {/* Print Overlay */}
      {showPrintDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ReceiptIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Complete!</h2>
            <p className="text-gray-500 mb-8 font-medium">Would you like to print a receipt for this transaction?</p>
            
            <div className="space-y-3">
              <button 
                onClick={finishPrint}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md shadow-red-500/30"
              >
                <Printer className="w-5 h-5" /> Print Receipt
              </button>
              <button 
                onClick={skipPrint}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Thermal Receipt */}
      {showPrintDialog && lastOrder && (
        <Receipt {...lastOrder} />
      )}
    </div>
  );
}
