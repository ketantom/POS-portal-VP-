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
    <div className="flex flex-col h-full bg-[var(--bg-white)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-gray)]">
        <h2 className="font-bold text-lg flex items-center gap-2">
          Current Invoice
          <span className="badge badge-red">{items.length} items</span>
        </h2>
        {items.length > 0 && (
          <button onClick={onClearCart} className="text-sm text-[var(--danger)] hover:underline">
            Clear
          </button>
        )}
      </div>

      {/* Cart Items Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-soft)]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-70">
            <div className="text-5xl mb-4">🛒</div>
            <p className="font-medium">Add products to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.product.id} className="card p-3 flex justify-between items-center animate-fade-in-up">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.product.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{formatCurrency(item.product.price)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[var(--bg-gray)] rounded-lg border border-[var(--border)] overflow-hidden">
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-[var(--border-light)] text-[var(--text-dark)] font-bold transition-colors"
                    >-</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                      className="px-2 py-1 hover:bg-[var(--border-light)] text-[var(--text-dark)] font-bold disabled:opacity-50 transition-colors"
                    >+</button>
                  </div>
                  <div className="w-20 text-right font-bold text-sm text-[var(--primary)]">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                  <button onClick={() => onRemoveItem(item.product.id)} className="text-[var(--danger)] hover:bg-[var(--danger-light)] p-1 rounded transition-colors">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Area */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-white)] flex flex-col gap-4">
        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-3">
          <input 
            type="text" 
            placeholder="Customer Name (Optional)" 
            className="input text-sm"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Phone (Optional)" 
            className="input text-sm"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        {/* Calculations */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-medium)]">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between">
            <label className="checkbox-wrapper">
              <input type="checkbox" checked={discountEnabled} onChange={(e) => setDiscountEnabled(e.target.checked)} className="hidden" />
              <div className={cn("toggle", discountEnabled && "active")} />
              <span className="text-[var(--text-medium)]">Discount</span>
            </label>
            {discountEnabled && (
              <input 
                type="number" 
                value={discountAmount} 
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                className="input text-sm w-24 text-right py-1" 
                placeholder="₹ 0"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="checkbox-wrapper">
              <input type="checkbox" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} className="hidden" />
              <div className={cn("toggle", gstEnabled && "active")} />
              <span className="text-[var(--text-medium)]">GST (5%)</span>
            </label>
            {gstEnabled && (
              <span className="font-semibold text-[var(--text-medium)]">{formatCurrency(gstAmount)}</span>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-3 border-t border-b border-[var(--border-light)]">
          <span className="font-bold text-lg">Grand Total</span>
          <span className="font-bold text-2xl text-[var(--primary)]">{formatCurrency(grandTotal)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <select 
            className="input w-1/3"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.name}>{pm.name}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary flex-1 py-3 text-base"
            disabled={items.length === 0 || isLoading}
            onClick={handleGenerate}
          >
            {isLoading ? (
              <span className="flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> Generating...</span>
            ) : 'Generate Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
