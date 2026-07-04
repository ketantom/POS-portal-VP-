'use client';

import { useAuthStore } from '@/lib/store/useAuthStore';
import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Header({ title, onMenuClick, isSidebarOpen, closeMenu }) {
  const { profile, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
    router.push('/login');
  };

  const navLinks = [
    { name: 'POS Terminal', href: '/' },
    { name: 'Manage SKUs', href: '/inventory' },
    { name: 'Accounts', href: '/accounts' },
    { name: 'Settings', href: '/staff', adminOnly: true }
  ];

  return (
    <header className="bg-white text-gray-800 border-b border-gray-200 h-16 flex items-center px-4 justify-between relative shadow-sm z-50">
      
      {/* LEFT SIDE: Hamburger & Branding */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          {/* Company Logo */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm overflow-hidden border border-gray-100 shrink-0">
            <img src="/logo.png" alt="Vijaya Products Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-gray-900">
                POS <span className="text-red-600">Portal</span>
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                {profile?.role?.toUpperCase() || 'CASHIER'}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Terminal #01 • Live Cloud Sync
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Navigation & Profile */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Quick Nav (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/reports" className={`flex items-center gap-1.5 text-sm font-medium ${pathname === '/reports' ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Reports
          </Link>
          <Link href="/sales" className={`flex items-center gap-1.5 text-sm font-medium ${pathname === '/sales' ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            History
          </Link>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 border border-green-300 flex items-center justify-center text-green-700 font-bold text-sm">
            {profile?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block text-sm font-bold text-gray-700">
            {profile?.role || 'Cashier'}
          </div>
          <button 
            onClick={handleSignOut}
            className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors ml-1"
            title="Sign Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>

      {/* HAMBURGER DROPDOWN MENU */}
      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={closeMenu}></div>
          <div className="absolute top-16 left-4 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-2">
            {navLinks.map((link) => {
              if (link.adminOnly && profile?.role !== 'Admin') return null;
              
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block px-5 py-3 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-red-50 text-red-600 border-l-4 border-red-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </header>
  );
}
