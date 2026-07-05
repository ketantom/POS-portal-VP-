'use client';
import React from 'react';
import Link from 'next/link';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 p-6 overflow-y-auto w-full animate-fade-in">
      <div className="mb-6 flex items-center">
        <Link href="/" className="btn btn-ghost text-sm flex items-center gap-2 text-[var(--primary)] hover:bg-[var(--primary-light)] px-3 py-1">
          <span>←</span> Back to POS
        </Link>
      </div>
      <div className="bg-[var(--bg-white)] rounded-xl border border-[var(--border)] shadow-sm p-6 max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  );
}
