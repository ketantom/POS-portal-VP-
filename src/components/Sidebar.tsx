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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-80 bg-[var(--bg-white)] shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
          <h2 className="text-lg font-bold text-[var(--text-dark)]">Settings Menu</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--bg-gray)] hover:text-[var(--text-dark)] transition-colors"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {visibleMenuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[var(--primary-light)] text-[var(--primary-dark)] border-l-4 border-[var(--primary)]'
                    : 'text-[var(--text-medium)] hover:bg-[var(--bg-gray)] hover:text-[var(--text-dark)] border-l-4 border-transparent hover:border-[var(--primary)]',
                  isOpen && `animate-slide-in-right delay-[${index * 50}ms]`
                )}
                style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 text-center border-t border-[var(--border)]">
           <button onClick={async () => {
             const { createClient } = await import('@/lib/supabase/client');
             const supabase = createClient();
             await supabase.auth.signOut();
             window.location.href = '/login';
           }} className="btn btn-ghost w-full">Sign Out</button>
        </div>
      </div>
    </>
  );
}
