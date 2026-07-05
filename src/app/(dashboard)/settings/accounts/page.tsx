'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AccountManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    // Note: Actually fetching auth users requires a secure server route or edge function
    // For this UI, we mock or fetch from a public 'profiles' table if we had one.
    // Assuming 'profiles' exists:
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    
    if (error) {
      // Mocking for preview if profiles table fails
      setUsers([
         { id: '1', email: 'admin@vijayaproducts.com', role: 'super_admin', status: 'active', created_at: new Date().toISOString() },
         { id: '2', email: 'manager@vijayaproducts.com', role: 'manager', status: 'active', created_at: new Date().toISOString() }
      ]);
    } else if (data) {
      setUsers(data as UserData[]);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full animate-fade-in pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <Link href="/" className="text-slate-400 hover:text-red-500 text-sm font-medium flex items-center gap-2 mb-4 transition-colors w-max">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage user access and roles for the POS portal.</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Invite User
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="px-6 py-5 rounded-tl-3xl">Email / Name</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5 text-right rounded-tr-3xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                    <span className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full mb-4"></span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm">
                           {user.email.charAt(0).toUpperCase()}
                         </div>
                         {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-xs capitalize border border-slate-200/60">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                        user.status === 'active' ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'active' ? "bg-emerald-500" : "bg-slate-400")} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-400 font-bold hover:text-red-600 bg-white hover:bg-red-50 px-4 py-2 rounded-xl border border-slate-200 hover:border-red-100 transition-all shadow-sm">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
