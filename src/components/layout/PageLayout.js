'use client';

import Header from './Header';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function PageLayout({ children }) {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-800 font-bold">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden p-2 md:p-4">
        {children}
      </main>
    </div>
  );
}
