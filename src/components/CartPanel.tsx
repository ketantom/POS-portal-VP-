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
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] overflow-hidden relative">
      {/* Frosted noise texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.015] pointer-events-none mix-blend-multiply" />
      
      {/* Header */}
      <div className="px-6 py-5 flex justify-between items-center relative z-10">
        <h2 className="font-extrabold text-lg text-slate-800 tracking-tight flex items-center gap-3">
          Current Order
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] tracking-widest uppercase border border-slate-200/50 shadow-sm">{items.length} items</span>
        </h2>
        {items.length > 0 && (
          <button onClick={onClearCart} className="text-xs text-slate-400 hover:text-rose-500 font-bold uppercase tracking-wider transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Cart Items Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar relative z-10">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <p className="font-medium text-sm">Cart is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-start group">
                <div className="flex-1 pr-3">
                  <div className="font-bold text-sm text-slate-800 leading-tight mb-1">{item.product.name}</div>
                  <div className="text-[11px] font-bold text-slate-400">{formatCurrency(item.product.price)}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="font-extrabold text-sm text-slate-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                  
                  {/* Modern Quantity Selector */}
                  <div className="flex items-center bg-slate-100/50 rounded-full p-0.5 border border-slate-200/50 shadow-sm">
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-white text-slate-600 shadow-sm hover:text-rose-600 transition-colors"
                    >-</button>
                    <span className="w-6 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-white text-slate-600 shadow-sm hover:text-rose-600 transition-colors"
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Area - The Receipt Base */}
      <div className="p-6 bg-slate-50/80 backdrop-blur-md flex flex-col gap-5 relative z-10 border-t border-slate-200/50">
        
        {/* Customer Info (Sleek inputs) */}
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Customer Name" 
            className="w-1/2 bg-white/60 border border-slate-200/50 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400 focus:bg-white transition-all placeholder:text-slate-400 font-medium text-slate-700 shadow-sm"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Phone (Optional)" 
            className="w-1/2 bg-white/60 border border-slate-200/50 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400 focus:bg-white transition-all placeholder:text-slate-400 font-medium text-slate-700 shadow-sm"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        {/* Calculations (Dashed separator style) */}
        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-500 font-medium">
            <span>Subtotal</span>
            <span className="font-bold text-slate-700">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discount Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={cn("w-7 h-4 rounded-full transition-colors relative shadow-inner", discountEnabled ? "bg-slate-800" : "bg-slate-200")}>
                <div className={cn("w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all shadow-sm", discountEnabled ? "left-3.5" : "left-0.5")} />
              </div>
              <input type="checkbox" checked={discountEnabled} onChange={(e) => setDiscountEnabled(e.target.checked)} className="hidden" />
              <span className="text-slate-500 font-medium">Discount</span>
            </label>
            {discountEnabled && (
              <input 
                type="number" 
                value={discountAmount || ''} 
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                className="w-20 bg-white border border-slate-200 rounded-md px-2 py-0.5 text-right text-xs outline-none focus:border-slate-400 font-bold text-slate-700 shadow-sm" 
                placeholder="₹ 0"
              />
            )}
          </div>

          {/* GST Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={cn("w-7 h-4 rounded-full transition-colors relative shadow-inner", gstEnabled ? "bg-slate-800" : "bg-slate-200")}>
                <div className={cn("w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all shadow-sm", gstEnabled ? "left-3.5" : "left-0.5")} />
              </div>
              <input type="checkbox" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} className="hidden" />
              <span className="text-slate-500 font-medium">GST (5%)</span>
            </label>
            {gstEnabled && (
              <span className="font-bold text-slate-700">{formatCurrency(gstAmount)}</span>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-end pt-1">
            <span className="font-bold text-slate-800 text-sm">Total</span>
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Payment Methods (Tactile Pills) */}
        <div className="flex flex-col gap-2 mt-2 border-t border-slate-200/50 pt-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</span>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map(pm => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.name)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border",
                  paymentMethod === pm.name 
                    ? "bg-slate-900 text-white border-slate-900 shadow-[0_2px_10px_rgb(0,0,0,0.2)]" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {pm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <button 
            className="flex-1 py-3.5 text-sm font-bold rounded-2xl text-white bg-rose-600 hover:bg-rose-700 shadow-[0_4px_14px_rgb(225,29,72,0.3)] hover:shadow-[0_6px_20px_rgb(225,29,72,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
            disabled={items.length === 0 || isLoading}
            onClick={handleGenerate}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/> 
                Processing...
              </span>
            ) : 'Checkout Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
