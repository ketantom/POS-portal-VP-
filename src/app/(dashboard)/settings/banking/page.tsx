'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function BankingDetailsPage() {
  const [banking, setBanking] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadBankingDetails();
  }, []);

  const loadBankingDetails = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('banking_details').select('*').single();
    if (data) {
      setBanking(data);
    }
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Check if exists
    const { data: existing } = await supabase.from('banking_details').select('id').single();
    
    let error;
    if (existing) {
      const res = await supabase.from('banking_details').update(banking).eq('id', existing.id);
      error = res.error;
    } else {
      const res = await supabase.from('banking_details').insert([banking]);
      error = res.error;
    }

    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Banking details saved successfully', 'success');
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto w-full animate-fade-in pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <Link href="/" className="text-slate-400 hover:text-red-500 text-sm font-medium flex items-center gap-2 mb-4 transition-colors w-max">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Banking Details</h1>
          <p className="text-slate-500 mt-2 font-medium">Update the company bank accounts printed on the invoices.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
             <span className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full"></span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bank Name</label>
                <input 
                  type="text" 
                  value={banking.bank_name || ''} 
                  onChange={e => setBanking({...banking, bank_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-medium text-slate-800"
                  required
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Holder Name</label>
                <input 
                  type="text" 
                  value={banking.account_name || ''} 
                  onChange={e => setBanking({...banking, account_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-medium text-slate-800"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Number</label>
                <input 
                  type="text" 
                  value={banking.account_number || ''} 
                  onChange={e => setBanking({...banking, account_number: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-medium text-slate-800 font-mono tracking-wider"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">IFSC Code</label>
                <input 
                  type="text" 
                  value={banking.ifsc_code || ''} 
                  onChange={e => setBanking({...banking, ifsc_code: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-medium text-slate-800 font-mono tracking-wider uppercase"
                  required
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col gap-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">UPI ID (Optional)</label>
                <input 
                  type="text" 
                  value={banking.upi_id || ''} 
                  onChange={e => setBanking({...banking, upi_id: e.target.value})}
                  placeholder="name@upi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none w-full md:w-auto justify-center"
              >
                {isSaving ? 'Saving Changes...' : 'Save Banking Details'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
