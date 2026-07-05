'use client';
import React from 'react';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import { FileText, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  isLoading?: boolean;
  onRefresh: () => void;
}

export default function InvoiceHistory({ invoices, onViewInvoice, isLoading, onRefresh }: InvoiceHistoryProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-extrabold text-lg text-slate-800 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          Recent Transactions
        </h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={onRefresh} 
            disabled={isLoading}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} /> 
            Refresh
          </button>
          <Link href="/settings/reports" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 transition-colors">
            All Reports
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-400">
              <th className="px-6 py-4">Invoice #</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading && invoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <span className="animate-spin inline-block w-6 h-6 border-2 border-slate-200 border-t-rose-500 rounded-full mb-2"></span>
                  <p className="text-xs font-medium text-slate-400">Loading history...</p>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No recent transactions</p>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr 
                  key={invoice.id} 
                  onClick={() => onViewInvoice(invoice)}
                  className="cursor-pointer hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-600 group-hover:text-rose-600 transition-colors">
                      {invoice.invoice_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    {formatDateTime(invoice.created_at)}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-800 text-sm">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      invoice.status === 'completed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                      invoice.status === 'cancelled' ? "bg-rose-50 text-rose-600 border border-rose-100" : 
                      "bg-amber-50 text-amber-600 border border-amber-100"
                    )}>
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
