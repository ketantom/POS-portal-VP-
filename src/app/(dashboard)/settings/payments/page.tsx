'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PaymentMethod } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [newMethod, setNewMethod] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('payment_methods').select('*').order('name');
    if (error) addToast('Failed to load payment methods', 'error');
    else if (data) setMethods(data as PaymentMethod[]);
    setIsLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethod.trim()) return;

    const { error } = await supabase.from('payment_methods').insert([{ name: newMethod.trim(), is_active: true }]);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Payment method added', 'success');
      setNewMethod('');
      loadMethods();
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('payment_methods').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      addToast(error.message, 'error');
    } else {
      loadMethods();
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full animate-fade-in pb-20">
      <div className="mb-8">
        <Link href="/" className="text-slate-400 hover:text-red-500 text-sm font-medium flex items-center gap-2 mb-4 transition-colors w-max">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Payment Methods</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage the payment options available to cashiers during checkout.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-3.5 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </span>
            <input 
              type="text" 
              value={newMethod} 
              onChange={(e) => setNewMethod(e.target.value)}
              placeholder="e.g. Google Pay, Amex..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-medium text-slate-800"
              required
            />
          </div>
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            Add Option
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
              <th className="px-6 py-5 rounded-tl-3xl">Method Name</th>
              <th className="px-6 py-5 text-right rounded-tr-3xl">Status / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={2} className="text-center py-20 text-slate-400 font-medium">
                  <span className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full mb-4"></span>
                </td>
              </tr>
            ) : methods.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-20 text-slate-400 font-medium">
                  No payment methods found.
                </td>
              </tr>
            ) : (
              methods.map((method) => (
                <tr key={method.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      {method.name}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => toggleStatus(method.id, method.is_active)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        method.is_active 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300" 
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full", method.is_active ? "bg-emerald-500" : "bg-slate-400")} />
                      {method.is_active ? 'Active' : 'Disabled'}
                    </button>
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
