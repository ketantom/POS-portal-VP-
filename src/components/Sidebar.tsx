'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', icon: '🏠', path: '/', roles: ['super_admin', 'manager', 'cashier'] },
    { label: 'Inventory', icon: '📦', path: '/settings/inventory', roles: ['super_admin', 'manager'] },
    { label: 'Payment Methods', icon: '💳', path: '/settings/payments', roles: ['super_admin', 'manager'] },
    { label: 'Banking Details', icon: '🏦', path: '/settings/banking', roles: ['super_admin'] },
    { label: 'Account Management', icon: '👥', path: '/settings/accounts', roles: ['super_admin', 'manager'] },
  ];

  const visibleMenuItems = menuItems.filter((item) => userRole && item.roles.includes(userRole));

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm animate-fade-in transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-[340px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-8">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2.5 text-slate-400 bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-6 flex-1 overflow-y-auto">
          {visibleMenuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'bg-red-50 text-red-600 shadow-[0_4px_20px_rgb(220,38,38,0.08)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                  isOpen && `animate-slide-in-right`
                )}
                style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
              >
                <span className={cn("text-xl p-2 rounded-xl transition-colors", isActive ? "bg-white text-red-500 shadow-sm" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
           <button onClick={async () => {
             const { createClient } = await import('@/lib/supabase/client');
             const supabase = createClient();
             await supabase.auth.signOut();
             window.location.href = '/login';
           }} className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             Sign Out
           </button>
        </div>
      </div>
    </>
  );
}
