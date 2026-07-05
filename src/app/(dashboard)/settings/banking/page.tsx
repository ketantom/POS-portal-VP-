'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BankingDetails } from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function BankingPage() {
  const [banking, setBanking] = useState<BankingDetails | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<BankingDetails>>({
    bank_name: '', account_number: '', ifsc_code: '', upi_id: '', account_holder_name: ''
  });

  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const loadBanking = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (currentProfile) setCurrentUserRole(currentProfile.role);

        if (currentProfile?.role !== 'cashier') {
          const { data } = await supabase.from('banking_details').select('*').limit(1).single();
          if (data) {
            setBanking(data as BankingDetails);
            setFormData(data as BankingDetails);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBanking();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'super_admin') {
      addToast('Only Super Admin can update banking details', 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      if (banking?.id) {
        const { error } = await supabase.from('banking_details').update(formData).eq('id', banking.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('banking_details').insert([formData]);
        if (error) throw error;
      }
      addToast('Banking details saved successfully', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to save', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><span className="animate-pulse">Loading...</span></div>;

  if (currentUserRole === 'cashier') {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-[var(--danger)]">Access Denied</h2>
      </div>
    );
  }

  const isReadOnly = currentUserRole !== 'super_admin';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-dark)] mb-2">Banking Details</h1>
        <p className="text-[var(--text-muted)] text-sm">
          {isReadOnly 
            ? 'View the company banking details. Only Super Admin can edit these.' 
            : 'Update the company banking details for invoices and records.'}
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="input-group">
          <label>Bank Name</label>
          <input 
            type="text" 
            className="input" 
            value={formData.bank_name || ''} 
            onChange={e => setFormData({...formData, bank_name: e.target.value})}
            disabled={isReadOnly}
            required
          />
        </div>
        
        <div className="input-group">
          <label>Account Holder Name</label>
          <input 
            type="text" 
            className="input" 
            value={formData.account_holder_name || ''} 
            onChange={e => setFormData({...formData, account_holder_name: e.target.value})}
            disabled={isReadOnly}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="input-group">
            <label>Account Number</label>
            <input 
              type="text" 
              className="input font-mono" 
              value={formData.account_number || ''} 
              onChange={e => setFormData({...formData, account_number: e.target.value})}
              disabled={isReadOnly}
              required
            />
          </div>
          
          <div className="input-group">
            <label>IFSC Code</label>
            <input 
              type="text" 
              className="input font-mono uppercase" 
              value={formData.ifsc_code || ''} 
              onChange={e => setFormData({...formData, ifsc_code: e.target.value})}
              disabled={isReadOnly}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>UPI ID (Optional)</label>
          <input 
            type="text" 
            className="input" 
            value={formData.upi_id || ''} 
            onChange={e => setFormData({...formData, upi_id: e.target.value})}
            disabled={isReadOnly}
          />
        </div>

        {!isReadOnly && (
          <div className="mt-6">
            <button type="submit" disabled={isSaving} className="btn btn-primary px-8 w-full sm:w-auto">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
