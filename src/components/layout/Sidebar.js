'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings, LogOut, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'Admin';

  const navItems = [
    { name: 'POS Terminal', href: '/', icon: ShoppingCart, requiresAdmin: false },
    { name: 'Recent Sales', href: '/sales', icon: FileText, requiresAdmin: false },
    { name: 'Manage SKUs', href: '/inventory', icon: Package, requiresAdmin: true },
    { name: 'Staff Access', href: '/staff', icon: Users, requiresAdmin: true },
    { name: 'Settings', href: '/settings', icon: Settings, requiresAdmin: true },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-40 transition-colors">
      <div className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
          P
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight leading-none text-gray-900 dark:text-white">POS Portal</h1>
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Version 2.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          if (item.requiresAdmin && !isAdmin) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 mb-4 border border-gray-200 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
            {profile?.display_name || profile?.email || 'Loading...'}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${profile?.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              {profile?.role || 'Guest'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
