'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { Invoice, InvoiceItem } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Printer, X } from 'lucide-react';

interface ReceiptProps {
  invoice: Invoice;
  items: InvoiceItem[];
  onClose?: () => void;
  onDelete?: (id: string) => void;
}

export default function Receipt({ invoice, items, onClose, onDelete }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      {/* SCREEN VIEW (Non-print) - Modal Overlay */}
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 hide-on-print transition-all duration-300">
        <div className="bg-slate-50 w-full max-w-sm max-h-[90vh] flex flex-col rounded-[32px] overflow-hidden shadow-2xl relative border border-white/20 animate-scale-in">
          
          {/* Close & Delete Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            {onDelete && (
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
                    onDelete(invoice.id);
                  }
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 transition-colors"
                title="Delete Invoice"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
            {onClose && (
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Receipt Content */}
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative">
            <div className="text-center mb-6 relative">
              <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-2">
                <Image src="/logo.png" alt="Vijaya Products Logo" width={50} height={50} className="object-contain" priority />
              </div>
              <h2 className="font-extrabold text-xl text-slate-900 tracking-tight">Vijaya Products</h2>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-medium">Jambharmala, Salgaon, Kudal</p>
            </div>
            
            <div className="border-t border-b border-dashed border-slate-300 py-3 mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium">Invoice No:</span>
                <span className="font-bold text-slate-800">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium">Date:</span>
                <span className="font-bold text-slate-800">{formatDateTime(invoice.created_at)}</span>
              </div>
              {invoice.customer_name && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <span className="font-bold text-slate-800">{invoice.customer_name}</span>
                </div>
              )}
            </div>

            <table className="w-full text-xs mb-4">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-500 font-medium uppercase tracking-wider text-[10px]">Item</th>
                  <th className="text-center py-2 text-slate-500 font-medium uppercase tracking-wider text-[10px]">Qty</th>
                  <th className="text-right py-2 text-slate-500 font-medium uppercase tracking-wider text-[10px]">Amt</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-slate-100/50 last:border-0">
                    <td className="py-2.5 text-slate-800 font-semibold">{item.product_name}</td>
                    <td className="py-2.5 text-center text-slate-600 font-bold">{item.quantity}</td>
                    <td className="py-2.5 text-right text-slate-800 font-bold">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-slate-300 pt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium">Subtotal:</span>
                <span className="font-bold text-slate-700">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount_enabled && (
                <div className="flex justify-between text-xs mb-1.5 text-rose-500">
                  <span className="font-medium">Discount:</span>
                  <span className="font-bold">-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              {invoice.gst_enabled && (
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-slate-500 font-medium">GST ({invoice.gst_rate}%):</span>
                  <span className="font-bold text-slate-700">{formatCurrency(invoice.gst_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg mt-2 pt-3 border-t border-slate-200 items-center">
                <span className="font-bold text-slate-500 text-sm">Total:</span>
                <span className="font-extrabold text-slate-900 tracking-tight">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
            
            <div className="text-center mt-6 text-xs text-slate-500 font-medium">
              <p>Payment via <span className="font-bold text-slate-800">{invoice.payment_method}</span></p>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <button 
              onClick={handlePrint} 
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.25)] active:scale-95"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>

      {/* PRINT VIEW (Optimized for 58mm Thermal Printer) */}
      {/* This only shows up when window.print() is called thanks to globals.css */}
      <div className="print-receipt">
        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
           {/* Using basic img for broad print compatibility */}
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', margin: '0 auto 2mm auto', display: 'block' }} />
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>VIJAYA PRODUCTS</div>
          <div style={{ fontSize: '10px' }}>Jambharmala, Salgaon, Tal. Kudal<br/>Dist. Sindhudurg, MH 416519</div>
        </div>
        
        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0' }}></div>
        
        <div style={{ marginBottom: '2mm', fontSize: '11px' }}>
          <div>Inv: {invoice.invoice_number}</div>
          <div>Date: {formatDateTime(invoice.created_at)}</div>
          {invoice.customer_name && <div>Cust: {invoice.customer_name}</div>}
        </div>
        
        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0' }}></div>
        
        <div style={{ width: '100%', marginBottom: '2mm' }}>
          <table style={{ width: '100%', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Item</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: '1mm 0' }}>{item.product_name}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{item.total_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0' }}></div>
        
        <div style={{ textAlign: 'right', fontSize: '11px' }}>
          <div>Sub: {invoice.subtotal.toFixed(2)}</div>
          {invoice.discount_enabled && <div>Disc: -{invoice.discount_amount.toFixed(2)}</div>}
          {invoice.gst_enabled && <div>GST({invoice.gst_rate}%): {invoice.gst_amount.toFixed(2)}</div>}
        </div>
        
        <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'right', margin: '2mm 0' }}>
          TOTAL: {invoice.total_amount.toFixed(2)}
        </div>
        
        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0' }}></div>
        
        <div style={{ textAlign: 'center', margin: '2mm 0', fontSize: '11px' }}>
          Pay Mode: {invoice.payment_method}
        </div>
        
        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0' }}></div>
        
        <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '4mm' }}>
          <div>Thank you for your purchase!</div>
          <div>*** Visit again! ***</div>
        </div>
      </div>
    </>
  );
}
