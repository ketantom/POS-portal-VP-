'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { formatDate } from '@/lib/utils';

export default function AccountsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  // Invite Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'cashier' | 'manager'>('cashier');
  const [invitePassword, setInvitePassword] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (currentProfile) setCurrentUserRole(currentProfile.role);

      if (currentProfile?.role !== 'cashier') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setProfiles(data as Profile[]);
      }
    } catch (error) {
      console.error(error);
      addToast('Failed to load accounts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      // Using signUp to create the user, which triggers handle_new_user function in DB
      const { error } = await supabase.auth.signUp({
        email: inviteEmail,
        password: invitePassword,
        options: {
          data: {
            full_name: inviteName,
            role: inviteRole
          }
        }
      });

      if (error) throw error;
      
      addToast('User created successfully!', 'success');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInvitePassword('');
      setInviteRole('cashier');
      loadProfiles();
    } catch (error: any) {
      addToast(error.message || 'Failed to create user', 'error');
    } finally {
      setIsInviting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, role: string) => {
    if (role === 'super_admin') {
      addToast('Cannot modify super admin', 'error');
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
      addToast('Status updated', 'success');
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><span className="animate-pulse">Loading accounts...</span></div>;
  }

  if (currentUserRole === 'cashier') {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-[var(--danger)]">Access Denied</h2>
        <p className="text-[var(--text-muted)] mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-dark)]">Account Management</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage user access and roles for the POS portal.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
          + Invite User
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id}>
                <td className="font-medium text-[var(--text-dark)]">{profile.full_name}</td>
                <td>{profile.email}</td>
                <td>
                  <span className={`badge ${
                    profile.role === 'super_admin' ? 'badge-red' : 
                    profile.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'badge-gray'
                  }`}>
                    {profile.role.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`badge ${profile.is_active ? 'badge-green' : 'badge-red'}`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-sm">{formatDate(profile.created_at)}</td>
                <td>
                  {profile.role !== 'super_admin' && (
                     <label className="checkbox-wrapper">
                       <input 
                         type="checkbox" 
                         checked={profile.is_active} 
                         onChange={() => handleToggleStatus(profile.id, profile.is_active, profile.role)} 
                         className="hidden" 
                       />
                       <div className={`toggle ${profile.is_active ? 'active' : ''}`} />
                     </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Invite New User</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-[var(--text-muted)] hover:text-black">✕</button>
            </div>
            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" required value={inviteName} onChange={e => setInviteName(e.target.value)} className="input" placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="input" placeholder="rahul@example.com" />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as any)} className="input">
                  <option value="cashier">Cashier (POS Only)</option>
                  <option value="manager">Manager (Inventory & Accounts)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Temporary Password</label>
                <input type="text" required value={invitePassword} onChange={e => setInvitePassword(e.target.value)} className="input" placeholder="At least 6 characters" minLength={6} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={isInviting} className="btn btn-primary">
                  {isInviting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
