'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { formatCurrency, cn } from '@/lib/utils';
import { Invoice, InvoiceItem } from '@/lib/types';
import { format } from 'date-fns';
import { Trash2, Search, Receipt as ReceiptIcon, Eye } from 'lucide-react';
import Receipt from '@/components/Receipt';

export default function TransactionsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Receipt viewing state
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentInvoiceItems, setCurrentInvoiceItems] = useState<InvoiceItem[]>([]);
  
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data as Invoice[]);
    } catch (error: any) {
      addToast(error.message || 'Failed to load transactions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoices(new Set(filteredInvoices.map(inv => inv.id)));
    } else {
      setSelectedInvoices(new Set());
    }
  };

  const handleSelectInvoice = (id: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInvoices(newSelected);
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

  const handleDeleteSelected = async () => {
    if (selectedInvoices.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedInvoices.size} transaction(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const idsToDelete = Array.from(selectedInvoices);
      
      // Delete invoice items first
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .in('invoice_id', idsToDelete);
        
      if (itemsError) throw itemsError;

      // Delete invoices
      const { error: invoicesError } = await supabase
        .from('invoices')
        .delete()
        .in('id', idsToDelete);
        
      if (invoicesError) throw invoicesError;

      addToast(`Successfully deleted ${selectedInvoices.size} transaction(s)`, 'success');
      setSelectedInvoices(new Set());
      loadInvoices();
    } catch (error: any) {
      addToast(error.message || 'Failed to delete transactions', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.customer_name && inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Recent Transactions</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and review all sales history</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoice or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-rose-400 transition-all font-medium text-slate-800 shadow-sm"
            />
          </div>
          
          {selectedInvoices.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl text-sm font-bold border border-rose-200 hover:bg-rose-100 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : `Delete (${selectedInvoices.size})`}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                <th className="px-6 py-5 rounded-tl-3xl w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedInvoices.size > 0 && selectedInvoices.size === filteredInvoices.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-5">Invoice</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Payment</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 rounded-tr-3xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-slate-400 font-medium">
                    <span className="animate-spin inline-block w-8 h-8 border-4 border-slate-100 border-t-rose-500 rounded-full mb-4"></span>
                    <p className="text-sm">Loading transactions...</p>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-slate-400 font-medium">
                    <ReceiptIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm">No transactions found.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <input 
                        type="checkbox" 
                        checked={selectedInvoices.has(inv.id)}
                        onChange={() => handleSelectInvoice(inv.id)}
                        className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-slate-800">
                        {format(new Date(inv.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {format(new Date(inv.created_at), 'hh:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-slate-800">{inv.customer_name || 'Walk-in Customer'}</div>
                    </td>
                    <td className="px-6 py-5 font-extrabold text-slate-800 text-sm">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {inv.payment_method || 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        inv.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleViewInvoice(inv)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showReceipt && currentInvoice && (
        <Receipt 
          invoice={currentInvoice} 
          items={currentInvoiceItems} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
    </div>
  );
}
