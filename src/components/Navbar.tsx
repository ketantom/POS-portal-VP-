'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface NavbarProps {
  userEmail?: string;
  onMenuToggle: () => void;
  userName?: string;
}

export default function Navbar({ userEmail, onMenuToggle, userName }: NavbarProps) {
  const displayName = userName || userEmail?.split('@')[0] || 'User';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-[150] px-4 sm:px-8 pt-4 sm:pt-6 pointer-events-none transition-all duration-500">
      <nav className={cn(
        "mx-auto max-w-[1600px] flex items-center justify-between rounded-full px-4 sm:px-6 py-3 pointer-events-auto transition-all duration-500",
        scrolled ? "bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50" : "bg-transparent"
      )}>
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 overflow-hidden rounded-2xl shadow-sm border border-slate-200/50 bg-white">
            <Image
              src="/logo.png"
              alt="Vijaya Products"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-slate-800 tracking-tight leading-none mb-0.5">Vijaya Products</span>
            <span className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">POS System</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-slate-200/50">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-none mb-1">Hello, {displayName}</span>
              {userEmail && <span className="text-[10px] font-medium text-slate-400">{userEmail}</span>}
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-600 font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          <button
            onClick={onMenuToggle}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/50 transition-all shadow-sm hover:shadow active:scale-95"
            aria-label="Settings Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </nav>
    </div>
  );
}
