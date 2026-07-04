'use client';

import Header from './Header';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useState } from 'react';
import Link from 'next/link';
import { X, LayoutDashboard, Settings, Package, BarChart3 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function PageLayout({ children }) {
  const { session, isLoading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-800 font-bold">Loading...</div>;
  }

  const navLinks = [
    { name: 'POS Terminal', href: '/', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 bg-gray-50">
          <span className="font-black text-gray-800 text-lg">Menu</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                  isActive 
                    ? 'bg-red-50 text-red-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-red-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <main className="flex-1 flex flex-col overflow-hidden p-2 md:p-4">
        {children}
      </main>
    </div>
  );
}
