'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { Download, TrendingUp, CreditCard, User, Calendar } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import Papa from 'papaparse';

interface DailySummary {
  date: string;
  totalSales: number;
  totalTransactions: number;
}

interface PaymentSummary {
  method: string;
  total: number;
  count: number;
}

interface AccountSummary {
  accountName: string;
  total: number;
  count: number;
}

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [dailySales, setDailySales] = useState<DailySummary[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentSummary[]>([]);
  const [accountStats, setAccountStats] = useState<AccountSummary[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [exportData, setExportData] = useState<any[]>([]);

  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  const loadReports = async () => {
    setIsLoading(true);
    
    try {
      const start = startOfDay(new Date(startDate));
      const end = endOfDay(new Date(endDate));

      // Fetch Invoices within date range
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount, 
          payment_method, 
          created_at, 
          created_by,
          status
        `)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .eq('status', 'completed');

      if (error) throw error;

      // Fetch Profiles separately to avoid foreign key relation errors
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, email');
      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => {
        profileMap[p.id] = p;
      });

      // Fetch Invoice Items
      const invoiceIds = invoices?.map(inv => inv.id) || [];
      const { data: invoiceItems } = await supabase
        .from('invoice_items')
        .select('*, products(sku_code)')
        .in('invoice_id', invoiceIds);

      // Process Data
      let rev = 0;
      let orders = 0;
      const dailyMap: Record<string, DailySummary> = {};
      const payMap: Record<string, PaymentSummary> = {};
      const accMap: Record<string, AccountSummary> = {};
      const csvRows: any[] = [];

      invoices?.forEach((inv: any) => {
        rev += inv.total_amount;
        orders++;

        // Daily
        const dateKey = format(new Date(inv.created_at), 'MMM dd, yyyy');
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { date: dateKey, totalSales: 0, totalTransactions: 0 };
        dailyMap[dateKey].totalSales += inv.total_amount;
        dailyMap[dateKey].totalTransactions++;

        // Payment
        const payKey = inv.payment_method || 'Unknown';
        if (!payMap[payKey]) payMap[payKey] = { method: payKey, total: 0, count: 0 };
        payMap[payKey].total += inv.total_amount;
        payMap[payKey].count++;

        // Account
        const profile = profileMap[inv.created_by];
        const accKey = profile?.full_name || profile?.email || 'Unknown User';
        if (!accMap[accKey]) accMap[accKey] = { accountName: accKey, total: 0, count: 0 };
        accMap[accKey].total += inv.total_amount;
        accMap[accKey].count++;

        // CSV Export Rows
        const items = invoiceItems?.filter(item => item.invoice_id === inv.id) || [];
        if (items.length === 0) {
          csvRows.push({
            'Invoice No': inv.invoice_number,
            'Date': format(new Date(inv.created_at), 'yyyy-MM-dd HH:mm:ss'),
            'Cashier': accKey,
            'Payment Method': inv.payment_method || 'Unknown',
            'Product Name': '',
            'SKU': '',
            'Quantity': '',
            'Unit Price': '',
            'Item Total': '',
            'Invoice Total': inv.total_amount
          });
        } else {
          items.forEach((item: any) => {
            csvRows.push({
              'Invoice No': inv.invoice_number,
              'Date': format(new Date(inv.created_at), 'yyyy-MM-dd HH:mm:ss'),
              'Cashier': accKey,
              'Payment Method': inv.payment_method || 'Unknown',
              'Product Name': item.product_name,
              'SKU': Array.isArray(item.products) ? item.products[0]?.sku_code : item.products?.sku_code || '',
              'Quantity': item.quantity,
              'Unit Price': item.unit_price,
              'Item Total': item.total_price,
              'Invoice Total': inv.total_amount
            });
          });
        }
      });

      setTotalRevenue(rev);
      setTotalOrders(orders);
      setDailySales(Object.values(dailyMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setPaymentStats(Object.values(payMap).sort((a, b) => b.total - a.total));
      setAccountStats(Object.values(accMap).sort((a, b) => b.total - a.total));
      setExportData(csvRows);

    } catch (error: any) {
      console.error(error);
      addToast('Failed to load reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (exportData.length === 0) return;
    
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Report exported successfully', 'success');
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full animate-fade-in pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <Link href="/" className="text-slate-400 hover:text-rose-500 text-sm font-medium flex items-center gap-2 mb-4 transition-colors w-max">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sales Reports & Analytics</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">Analyze day-to-day sales performance and revenue breakdown.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">From</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-rose-400 transition-colors"
              />
            </div>
            <div className="w-px h-8 bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">To</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-rose-400 transition-colors"
              />
            </div>
          </div>
          <button 
            onClick={exportReport}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold shadow-[0_4px_14px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
            disabled={isLoading || exportData.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <span className="animate-spin inline-block w-10 h-10 border-4 border-slate-200 border-t-rose-500 rounded-full"></span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/10 to-transparent opacity-50 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-500">Total Revenue</h3>
              </div>
              <div className="text-5xl font-extrabold text-slate-900 tracking-tight relative z-10">
                {formatCurrency(totalRevenue)}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent opacity-50 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-500">Total Orders</h3>
              </div>
              <div className="text-5xl font-extrabold text-slate-900 tracking-tight relative z-10">
                {totalOrders}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Payment Methods */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm">
              <h3 className="font-extrabold text-xl text-slate-800 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-400" />
                Sales by Payment Method
              </h3>
              {paymentStats.length === 0 ? (
                <p className="text-slate-400 font-medium">No payment data available.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {paymentStats.map(stat => (
                    <div key={stat.method} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-sm">{stat.method}</span>
                        <span className="text-xs font-medium text-slate-400">{stat.count} orders</span>
                      </div>
                      <span className="font-extrabold text-lg text-slate-900">{formatCurrency(stat.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Breakdown */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm">
              <h3 className="font-extrabold text-xl text-slate-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                Sales by Cashier
              </h3>
              {accountStats.length === 0 ? (
                <p className="text-slate-400 font-medium">No cashier data available.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {accountStats.map(stat => (
                    <div key={stat.accountName} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{stat.accountName}</span>
                        <span className="text-xs font-medium text-slate-400">{stat.count} orders processed</span>
                      </div>
                      <span className="font-extrabold text-lg text-slate-900">{formatCurrency(stat.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm mt-2">
            <h3 className="font-extrabold text-xl text-slate-800 mb-6">Daily Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    <th className="py-4 px-2">Date</th>
                    <th className="py-4 px-2 text-center">Transactions</th>
                    <th className="py-4 px-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dailySales.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-slate-400 font-medium">No sales history found for this period.</td>
                    </tr>
                  ) : (
                    dailySales.map(day => (
                      <tr key={day.date} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-2 font-bold text-slate-700">{day.date}</td>
                        <td className="py-4 px-2 text-center font-bold text-slate-500">{day.totalTransactions}</td>
                        <td className="py-4 px-2 text-right font-extrabold text-slate-900">{formatCurrency(day.totalSales)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
