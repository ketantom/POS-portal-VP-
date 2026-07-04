'use client';

import Header from './Header';
import { useState } from 'react';

export default function PageLayout({ children, title }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header 
          title={title} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen}
          closeMenu={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
