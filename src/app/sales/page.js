'use client';

import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Receipt, Search, Trash2, Edit2, Calendar } from 'lucide-react';

export default function SalesPage() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'Admin';
  
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    // Fetch sales and join with profiles to get cashier name
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        cashier:profiles(display_name, email),
        items:sale_items(*)
      `)
      .order('created_at', { ascending: false });
      
    if (!error && data) setSales(data);
    setLoading(false);
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this transaction?')) return;
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      setSales(sales.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete sale: ' + err.message);
    }
  };

  return (
    <PageLayout title="Recent Sales">
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Transaction ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-purple-500 text-sm font-medium transition-colors"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm transition">
              <Calendar className="w-4 h-4" /> Filter Date
            </button>
          </div>
        </div>

        {/* Sales List */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400 font-medium">Loading sales history...</div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Receipt className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Transactions Found</h3>
              <p className="text-sm text-gray-500">Sales records will appear here once processed.</p>
            </div>
          ) : (
            sales.map(sale => {
              const date = new Date(sale.created_at);
              const cashierName = sale.cashier?.display_name || sale.cashier?.email || 'Unknown';
              const itemsCount = sale.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
              const itemsSummary = sale.items?.map(i => `${i.quantity}x ${i.name}`).join(', ') || '';

              return (
                <div key={sale.id} className="p-4 sm:p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white dark:hover:bg-gray-900 transition-colors group">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                        {sale.id.split('-')[0].toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase flex items-center gap-1.5">
                        {sale.payment_method === 'Cash' ? '💵' : sale.payment_method === 'Card' ? '💳' : '📱'}
                        {sale.payment_method}
                        {sale.receiving_account && <span className="text-gray-400 dark:text-gray-500 font-medium ml-1">• {sale.receiving_account}</span>}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                      <span>{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>Cashier: {cashierName}</span>
                    </div>
                    
                    {itemsSummary && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate max-w-xl">
                        🛍️ {itemsSummary}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0 border-t border-gray-200 dark:border-gray-800 sm:border-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right flex items-center justify-between sm:block w-full">
                      <span className="text-lg font-extrabold text-gray-900 dark:text-white">₹{Number(sale.total_amount).toFixed(2)}</span>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 sm:mt-0">{itemsCount} item{itemsCount !== 1 ? 's' : ''}</p>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs transition">
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDelete(sale.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold text-xs transition">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageLayout>
  );
}
