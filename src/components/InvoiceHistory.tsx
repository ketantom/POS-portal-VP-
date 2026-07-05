'use client';
import React from 'react';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  isLoading?: boolean;
  onRefresh: () => void;
}

export default function InvoiceHistory({ invoices, onViewInvoice, isLoading, onRefresh }: InvoiceHistoryProps) {
  return (
    <div className="card mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-[var(--text-dark)]">Recent Invoices</h3>
        <button 
          onClick={onRefresh} 
          disabled={isLoading}
          className="text-sm text-[var(--primary)] hover:underline disabled:opacity-50 flex items-center gap-1"
        >
          {isLoading ? <span className="animate-spin inline-block w-3 h-3 border-2 border-[var(--primary)] border-t-transparent rounded-full"/> : '↻'} Refresh
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && invoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  <div className="skeleton skeleton-text w-full"></div>
                  <div className="skeleton skeleton-text w-full mt-2"></div>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-[var(--text-muted)]">
                  No recent invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr 
                  key={invoice.id} 
                  onClick={() => onViewInvoice(invoice)}
                  className="cursor-pointer hover:bg-[var(--bg-soft)] transition-colors"
                >
                  <td className="font-semibold text-[var(--text-dark)]">{invoice.invoice_number}</td>
                  <td className="text-[var(--text-muted)] text-sm">{formatDateTime(invoice.created_at)}</td>
                  <td className="font-bold text-[var(--primary)]">{formatCurrency(invoice.total_amount)}</td>
                  <td>
                    <span className={`badge ${invoice.status === 'completed' ? 'badge-green' : invoice.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
