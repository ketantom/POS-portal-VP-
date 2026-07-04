'use client';

import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { BarChart3, TrendingUp, IndianRupee, CreditCard, Smartphone } from 'lucide-react';

export default function ReportsPage() {
  const { profile } = useAuthStore();
  
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  useEffect(() => {
    fetchDailyReport();
  }, [dateStr]);

  async function fetchDailyReport() {
    setLoading(true);
    
    // Create start and end timestamps for the selected date in local timezone
    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateStr);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (!error && data) {
      setSales(data);
    }
    setLoading(false);
  }

  // Calculate aggregates
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const totalTransactions = sales.length;
  
  const byMethod = sales.reduce((acc, s) => {
    acc[s.payment_method] = (acc[s.payment_method] || 0) + Number(s.total_amount);
    return acc;
  }, { Cash: 0, Card: 0, UPI: 0 });

  return (
    <PageLayout title="Daily Reports">
      <div className="space-y-6">
        
        {/* Date Selector Header */}
        <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" /> Revenue Report
            </h2>
            <p className="text-sm text-gray-500 mt-1">View total collections grouped by payment method.</p>
          </div>
          <input 
            type="date" 
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-purple-500 font-medium text-gray-900 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 font-medium">Generating report...</div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="relative z-10">
                  <p className="text-purple-200 font-medium flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5" /> Total Revenue
                  </p>
                  <h3 className="text-5xl font-extrabold tracking-tight">₹{totalRevenue.toFixed(2)}</h3>
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-center">
                <p className="text-gray-500 font-medium mb-2">Total Transactions</p>
                <h3 className="text-5xl font-extrabold text-gray-900 dark:text-white">{totalTransactions}</h3>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white pt-4">Collection Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Cash */}
              <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cash</p>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">₹{byMethod.Cash.toFixed(2)}</h4>
                </div>
              </div>

              {/* Card */}
              <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Card</p>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">₹{byMethod.Card.toFixed(2)}</h4>
                </div>
              </div>

              {/* UPI */}
              <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">UPI</p>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">₹{byMethod.UPI.toFixed(2)}</h4>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
