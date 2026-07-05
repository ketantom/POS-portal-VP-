'use client';
import React from 'react';
import Image from 'next/image';
import { Invoice, InvoiceItem } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface ReceiptProps {
  invoice: Invoice;
  items: InvoiceItem[];
}

export default function Receipt({ invoice, items }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* SCREEN VIEW (Non-print) */}
      <div className="w-full max-w-sm bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden mb-6 hide-on-print">
        <div className="p-6">
          <div className="text-center mb-6">
            <Image src="/logo.png" alt="Vijaya Products Logo" width={80} height={80} className="mx-auto mb-2" />
            <h2 className="font-bold text-xl text-gray-800">Vijaya Products</h2>
            <p className="text-xs text-gray-500 mt-1">Jambharmala, Salgaon, Tal. Kudal<br/>Dist. Sindhudurg, Maharashtra, 416519</p>
          </div>
          
          <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Invoice No:</span>
              <span className="font-semibold">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Date:</span>
              <span>{formatDateTime(invoice.created_at)}</span>
            </div>
            {invoice.customer_name && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer:</span>
                <span>{invoice.customer_name}</span>
              </div>
            )}
          </div>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Item</th>
                <th className="text-center py-2 text-gray-500 font-medium">Qty</th>
                <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 text-gray-800">{item.product_name}</td>
                  <td className="py-2 text-center text-gray-800">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-800">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-300 pt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount_enabled && (
              <div className="flex justify-between text-sm mb-1 text-red-500">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            {invoice.gst_enabled && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">GST ({invoice.gst_rate}%):</span>
                <span>{formatCurrency(invoice.gst_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-[var(--primary)]">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
          
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>Payment: <span className="font-semibold text-gray-800">{invoice.payment_method}</span></p>
            <p className="mt-2 text-xs">Thank you for your purchase!<br/>Visit again!</p>
          </div>
        </div>
      </div>

      <button onClick={handlePrint} className="btn btn-primary px-8 py-3 w-full max-w-sm text-lg hide-on-print shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        🖨️ Print Receipt
      </button>

      {/* PRINT VIEW (Optimized for 58mm Thermal Printer) */}
      <div className="print-receipt">
        <div className="receipt-header">
           {/* Not using next/image in print mode as we want a simple img tag for better print compatibility */}
          <img src="/logo.png" alt="Logo" className="receipt-logo" />
          <div className="receipt-company">VIJAYA PRODUCTS</div>
          <div className="receipt-address">Jambharmala, Salgaon, Tal. Kudal<br/>Dist. Sindhudurg, MH 416519</div>
        </div>
        
        <div className="receipt-divider"></div>
        
        <div style={{ marginBottom: '2mm' }}>
          <div>Inv: {invoice.invoice_number}</div>
          <div>Date: {formatDateTime(invoice.created_at)}</div>
          {invoice.customer_name && <div>Cust: {invoice.customer_name}</div>}
        </div>
        
        <div className="receipt-divider"></div>
        
        <div className="receipt-items">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style={{textAlign: 'center'}}>Qty</th>
                <th>Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td style={{textAlign: 'center'}}>{item.quantity}</td>
                  <td>{item.total_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="receipt-divider"></div>
        
        <div style={{ textAlign: 'right' }}>
          <div>Sub: {invoice.subtotal.toFixed(2)}</div>
          {invoice.discount_enabled && <div>Disc: -{invoice.discount_amount.toFixed(2)}</div>}
          {invoice.gst_enabled && <div>GST({invoice.gst_rate}%): {invoice.gst_amount.toFixed(2)}</div>}
        </div>
        
        <div className="receipt-total">
          TOTAL: {invoice.total_amount.toFixed(2)}
        </div>
        
        <div className="receipt-divider"></div>
        
        <div style={{ textAlign: 'center', margin: '2mm 0' }}>
          Pay Mode: {invoice.payment_method}
        </div>
        
        <div className="receipt-divider"></div>
        
        <div className="receipt-footer">
          <div>Thank you for your purchase!</div>
          <div>*** Visit again! ***</div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media screen {
          .print-receipt { display: none; }
        }
        @media print {
          .hide-on-print { display: none !important; }
        }
      `}} />
    </div>
  );
}
