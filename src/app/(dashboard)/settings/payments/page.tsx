'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PaymentMethod } from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function PaymentsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [newMethodName, setNewMethodName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const { addToast } = useToast();
  const supabase = createClient();

  const loadMethods = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (currentProfile) setCurrentUserRole(currentProfile.role);

      if (currentProfile?.role !== 'cashier') {
        const { data } = await supabase.from('payment_methods').select('*').order('name');
        if (data) setMethods(data as PaymentMethod[]);
      }
    } catch (error) {
      addToast('Failed to load payment methods', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadMethods(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName.trim()) return;
    
    setIsAdding(true);
    try {
      const { error } = await supabase.from('payment_methods').insert([{ name: newMethodName.trim(), is_active: true }]);
      if (error) throw error;
      
      addToast('Payment method added', 'success');
      setNewMethodName('');
      loadMethods();
    } catch (error: any) {
      addToast(error.message || 'Failed to add method', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('payment_methods').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      setMethods(prev => prev.map(m => m.id === id ? { ...m, is_active: !currentStatus } : m));
      addToast('Status updated', 'success');
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  if (isLoading) return <div className="p-8 text-center"><span className="animate-pulse">Loading methods...</span></div>;

  if (currentUserRole === 'cashier') {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-[var(--danger)]">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-dark)] mb-2">Payment Methods</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">Manage the payment options available during checkout.</p>
        
        <form onSubmit={handleAdd} className="flex gap-3">
          <input 
            type="text" 
            placeholder="e.g. Credit Card, UPI..." 
            className="input flex-1"
            value={newMethodName}
            onChange={e => setNewMethodName(e.target.value)}
            required
          />
          <button type="submit" disabled={isAdding} className="btn btn-primary px-6">
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {methods.map(method => (
          <div key={method.id} className={`card flex justify-between items-center p-4 ${!method.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
            <span className="font-semibold text-[var(--text-dark)]">{method.name}</span>
            <label className="checkbox-wrapper">
              <span className="text-xs text-[var(--text-muted)] mr-2">{method.is_active ? 'Active' : 'Disabled'}</span>
              <input type="checkbox" checked={method.is_active} onChange={() => handleToggleStatus(method.id, method.is_active)} className="hidden" />
              <div className={`toggle ${method.is_active ? 'active' : ''}`} />
            </label>
          </div>
        ))}
        {methods.length === 0 && (
          <div className="text-center p-6 border border-dashed border-[var(--border)] rounded-lg text-[var(--text-muted)]">
            No payment methods found. Add one above.
          </div>
        )}
      </div>
    </div>
  );
}
