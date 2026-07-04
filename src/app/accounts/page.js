'use client';

import PageLayout from '@/components/layout/PageLayout';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Trash2, Plus } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    // Since the table might not exist yet, we try to fetch it.
    const { data, error } = await supabase.from('accounts').select('*').order('name');
    if (!error && data) {
      setAccounts(data);
    } else {
      console.warn('Accounts table missing or empty. Please run the SQL migration.');
    }
    setLoading(false);
  }

  async function handleAddAccount(e) {
    e.preventDefault();
    if (!newAccount.trim()) return;
    
    const { data, error } = await supabase
      .from('accounts')
      .insert({ name: newAccount.trim() })
      .select()
      .single();
      
    if (!error && data) {
      setAccounts([...accounts, data]);
      setNewAccount('');
    } else {
      alert('Failed to add account. Make sure the accounts table exists in Supabase.');
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  }

  return (
    <PageLayout title="Manage UPI Accounts">
      <div className="max-w-3xl mx-auto h-full flex flex-col">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Receiving Accounts</h2>
          <p className="text-sm text-gray-500 mb-6">
            Add or remove UPI/QR receiving accounts here. These will appear in the checkout dropdown when a cashier selects UPI/QR.
          </p>
          
          <form onSubmit={handleAddAccount} className="flex gap-3 mb-8">
            <input 
              type="text" 
              value={newAccount}
              onChange={(e) => setNewAccount(e.target.value)}
              placeholder="e.g. HDFC Current, PhonePe QR..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
            />
            <button 
              type="submit"
              disabled={!newAccount.trim()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" /> Add Account
            </button>
          </form>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
              No accounts found. Add one above!
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Account Name</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{acc.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(acc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
