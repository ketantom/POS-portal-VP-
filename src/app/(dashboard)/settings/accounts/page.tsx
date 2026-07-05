'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Trash2, Edit2, X, UserCheck } from 'lucide-react';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

interface UserData {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  full_name: string;
}

export default function AccountManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'cashier',
    is_active: true
  });

  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    // Get current user role to verify if they can manage admins
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
       const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
       if (profile) setCurrentUserRole(profile.role);
    }

    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    
    if (error) {
      addToast('Failed to load users from database', 'error');
    } else if (data) {
      setUsers(data as UserData[]);
    }
    setIsLoading(false);
  };

  const handleOpenModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        full_name: user.full_name || '',
        role: user.role,
        is_active: user.is_active
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'cashier',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingUser) {
        // Just update profile in this mock system (since we don't have Admin API access securely here to change passwords)
        const { error } = await supabase.from('profiles').update({
          full_name: formData.full_name,
          role: formData.role,
          is_active: formData.is_active
        }).eq('id', editingUser.id);
        
        if (error) throw error;
        addToast('User updated successfully', 'success');
      } else {
         if (!formData.password) {
           addToast('Password is required for new users', 'error');
           setIsSaving(false);
           return;
         }
         
         const secondarySupabase = createSupabaseClient(
           process.env.NEXT_PUBLIC_SUPABASE_URL!,
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
           { auth: { persistSession: false, autoRefreshToken: false } }
         );

         const { data, error: signUpError } = await secondarySupabase.auth.signUp({
           email: formData.email,
           password: formData.password,
           options: {
             data: {
               full_name: formData.full_name
             }
           }
         });

         if (signUpError) throw signUpError;
         if (!data.user) throw new Error('Failed to create user');

         // Wait a moment for the profile trigger to run (if it exists)
         await new Promise(resolve => setTimeout(resolve, 1000));

         // Update or insert the profile with the correct role using the admin session
         const { error: profileError } = await supabase.from('profiles').upsert({
           id: data.user.id,
           email: formData.email,
           full_name: formData.full_name,
           role: formData.role,
           is_active: formData.is_active
         });

         if (profileError) throw profileError;
         
         addToast('User invited successfully!', 'success');
      }
      
      setShowModal(false);
      loadData();
    } catch (error: any) {
      addToast(error.message || 'Failed to save user', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', id);
      if (error) throw error;
      addToast('User deactivated successfully', 'success');
      loadData();
    } catch (error: any) {
      addToast(error.message || 'Failed to deactivate user', 'error');
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full animate-fade-in pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <Link href="/" className="text-slate-400 hover:text-rose-500 text-sm font-medium flex items-center gap-2 mb-4 transition-colors w-max">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account Management</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">Manage user access and roles for the POS portal.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold shadow-[0_4px_14px_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.25)] hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
        >
          <Plus className="w-5 h-5" />
          Invite User
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                <th className="px-6 py-5 rounded-tl-3xl">User</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5 text-right rounded-tr-3xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                    <span className="animate-spin inline-block w-8 h-8 border-4 border-slate-100 border-t-rose-500 rounded-full mb-4"></span>
                    <p className="text-sm">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                    <UserCheck className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 font-bold border border-white/50 shadow-sm text-lg">
                           {(user.full_name || user.email).charAt(0).toUpperCase()}
                         </div>
                         <div>
                           <div className="font-bold text-slate-800 text-sm">{user.full_name || 'No Name'}</div>
                           <div className="text-[11px] text-slate-500 font-medium">{user.email}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider border border-slate-200/60">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        user.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", user.is_active ? "bg-emerald-500" : "bg-slate-400")} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          disabled={user.role === 'super_admin'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative border border-white/20 animate-scale-in">
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(false); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-10"
            >
              <X className="w-4 h-4 pointer-events-none" />
            </button>
            <div className="p-8 relative">
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">{editingUser ? 'Edit User' : 'Invite User'}</h2>
              <form onSubmit={handleSaveUser} className="flex flex-col gap-5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input required type="email" disabled={!!editingUser} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all font-medium text-slate-800 shadow-sm disabled:opacity-50" placeholder="user@vijayaproducts.com" />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Temporary Password</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all font-medium text-slate-800 shadow-sm" placeholder="Minimum 6 characters" minLength={6} />
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all font-medium text-slate-800 shadow-sm" placeholder="John Doe" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all font-medium text-slate-800 shadow-sm appearance-none cursor-pointer"
                    disabled={editingUser?.role === 'super_admin'}
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    {currentUserRole === 'super_admin' && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>
                
                <div className="flex items-center gap-3 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={cn("w-10 h-6 rounded-full transition-colors relative shadow-inner", formData.is_active ? "bg-emerald-500" : "bg-slate-200")}>
                      <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm", formData.is_active ? "left-5" : "left-1")} />
                    </div>
                    <input type="checkbox" disabled={editingUser?.role === 'super_admin'} checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="hidden" />
                  </label>
                  <span className="text-sm font-bold text-slate-700">Account Active</span>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="submit" disabled={isSaving} className="w-full py-3 text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-[0_4px_14px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center">
                    {isSaving ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> : 'Save User Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
