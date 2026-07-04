'use client';

import { useAuthStore } from '@/lib/store/useAuthStore';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Menu, Search, LogOut } from 'lucide-react';

export default function Header() {
  const { profile, session } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40 print:hidden shadow-sm">
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-white">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-black text-gray-800 tracking-tight">
            Vijaya <span className="text-red-600">Products</span>
          </span>
        </div>
      </div>

      {session && (
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all text-gray-800 font-medium"
            />
          </div>
        </div>
      )}

      {session && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800 leading-tight">{profile?.email || 'User'}</p>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">{profile?.role || 'Staff'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
}
