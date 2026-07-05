'use client';
import React, { useState } from 'react';
import { CartItem, PaymentMethod } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

export interface InvoiceData {
  customerName: string;
  customerPhone: string;
  discountEnabled: boolean;
  discountAmount: number;
  gstEnabled: boolean;
  gstRate: number;
  paymentMethod: string;
}

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onGenerateInvoice: (data: InvoiceData) => void;
  paymentMethods: PaymentMethod[];
  isLoading?: boolean;
}

export default function CartPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onGenerateInvoice,
  paymentMethods,
  isLoading
}: CartPanelProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate] = useState(5); // Default 5%
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const finalDiscount = discountEnabled ? discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - finalDiscount);
  const gstAmount = gstEnabled ? (taxableAmount * gstRate) / 100 : 0;
  const grandTotal = taxableAmount + gstAmount;

  const handleGenerate = () => {
    if (items.length === 0) return;
    onGenerateInvoice({
      customerName,
      customerPhone,
      discountEnabled,
      discountAmount: finalDiscount,
      gstEnabled,
      gstRate,
      paymentMethod
    });
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-slide-in-right relative">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full blur-[80px] -z-10 opacity-60 mix-blend-multiply" />
      
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center z-10">
        <h2 className="font-bold text-xl text-slate-800 flex items-center gap-3">
          Current Order
          <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">{items.length} items</span>
        </h2>
        {items.length > 0 && (
          <button onClick={onClearCart} className="text-sm text-slate-400 hover:text-red-500 font-medium transition-colors">
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items Area */}
      <div className="flex-1 overflow-y-auto p-4 z-10">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="text-6xl mb-4 opacity-50 grayscale">🛒</div>
            <p className="font-medium">Add products to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white rounded-2xl p-3 flex justify-between items-center shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow group">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-bold text-sm text-slate-800 truncate">{item.product.name}</div>
                  <div className="text-xs text-slate-400 font-medium">{formatCurrency(item.product.price)}</div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Modern Quantity Selector */}
                  <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-white text-slate-600 shadow-sm hover:text-red-600 transition-colors"
                    >-</button>
                    <span className="w-8 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-white text-slate-600 shadow-sm hover:text-red-600 transition-colors"
                    >+</button>
                  </div>
                  <div className="w-20 text-right font-extrabold text-sm text-slate-800">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                  <button onClick={() => onRemoveItem(item.product.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Area */}
      <div className="p-6 border-t border-slate-100 bg-white/60 backdrop-blur-md flex flex-col gap-5 z-10">
        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-3">
          <input 
            type="text" 
            placeholder="Customer Name" 
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-slate-400 font-medium text-slate-700"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Phone (Optional)" 
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-slate-400 font-medium text-slate-700"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        {/* Calculations */}
        <div className="flex flex-col gap-3 text-sm bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="font-bold text-slate-700">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={cn("w-10 h-6 rounded-full transition-colors relative", discountEnabled ? "bg-red-500" : "bg-slate-300")}>
                <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm", discountEnabled ? "left-5" : "left-1")} />
              </div>
              <input type="checkbox" checked={discountEnabled} onChange={(e) => setDiscountEnabled(e.target.checked)} className="hidden" />
              <span className="text-slate-500 font-medium group-hover:text-slate-800 transition-colors">Discount</span>
            </label>
            {discountEnabled && (
              <input 
                type="number" 
                value={discountAmount} 
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right text-sm outline-none focus:border-red-400 font-bold text-slate-700" 
                placeholder="₹ 0"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={cn("w-10 h-6 rounded-full transition-colors relative", gstEnabled ? "bg-red-500" : "bg-slate-300")}>
                <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm", gstEnabled ? "left-5" : "left-1")} />
              </div>
              <input type="checkbox" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} className="hidden" />
              <span className="text-slate-500 font-medium group-hover:text-slate-800 transition-colors">GST (5%)</span>
            </label>
            {gstEnabled && (
              <span className="font-bold text-slate-700">{formatCurrency(gstAmount)}</span>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-end pt-2 pb-1">
          <span className="font-bold text-slate-800 text-lg">Grand Total</span>
          <span className="font-extrabold text-3xl text-red-600 tracking-tight">{formatCurrency(grandTotal)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <select 
            className="w-1/3 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-red-400 font-bold text-slate-700 shadow-sm appearance-none"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.name}>{pm.name}</option>
            ))}
          </select>
          <button 
            className="flex-1 py-4 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-[0_8px_20px_rgb(220,38,38,0.3)] hover:shadow-[0_8px_25px_rgb(220,38,38,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
            disabled={items.length === 0 || isLoading}
            onClick={handleGenerate}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> 
                Processing...
              </span>
            ) : 'Generate Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
