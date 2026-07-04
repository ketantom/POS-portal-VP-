'use client';

import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Shield, ShieldAlert, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export default function StaffPage() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'Admin';
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  }

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
      if (error) throw error;
      setUsers(users.map(u => u.id === id ? { ...u, status } : u));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const updateRole = async (id, role) => {
    try {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
      if (error) throw error;
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Warning: This will permanently delete this profile. Note: Actual authentication user must be deleted from Supabase Auth dashboard. Continue?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user profile: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <PageLayout title="Access Denied">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access Required</h2>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Staff Access">
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" /> User Roles & Access
          </h3>
          <p className="text-sm text-gray-500 mt-1">Manage who can access the POS terminal and perform admin actions.</p>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-400 font-medium">Loading staff list...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-medium">No users found.</div>
          ) : (
            users.map(user => {
              const isApproved = user.status === 'approved';
              const isRevoked = user.status === 'revoked';
              const isUserAdmin = user.role === 'Admin';
              const isSelf = user.id === profile.id;

              return (
                <div key={user.id} className="p-4 sm:p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                      {(user.display_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                          {user.display_name || 'Staff Member'} {isSelf && <span className="text-[10px] text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">(You)</span>}
                        </h4>
                        
                        {isApproved ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">Approved</span>
                        ) : isRevoked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">Revoked</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300">Pending</span>
                        )}

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isUserAdmin ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                          {isUserAdmin ? 'Role 1: Admin' : 'Role 2: Cashier'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1">{user.email}</p>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex flex-wrap gap-2 sm:justify-end shrink-0">
                      {!isApproved && (
                        <button onClick={() => updateStatus(user.id, 'approved')} className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 transition">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {!isRevoked && (
                        <button onClick={() => updateStatus(user.id, 'revoked')} className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-bold text-xs flex items-center gap-1.5 transition">
                          <XCircle className="w-3.5 h-3.5" /> Revoke
                        </button>
                      )}
                      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center hidden sm:block"></div>
                      {!isUserAdmin ? (
                        <button onClick={() => updateRole(user.id, 'Admin')} className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 font-bold text-xs transition">
                          Make Admin
                        </button>
                      ) : (
                        <button onClick={() => updateRole(user.id, 'Cashier')} className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs transition">
                          Make Cashier
                        </button>
                      )}
                      <button onClick={() => deleteUser(user.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageLayout>
  );
}
