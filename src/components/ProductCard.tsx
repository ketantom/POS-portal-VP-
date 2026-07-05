'use client';
import React from 'react';
import { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const colors = [
    'from-rose-500/10 to-rose-50 text-rose-600',
    'from-amber-500/10 to-amber-50 text-amber-600',
    'from-emerald-500/10 to-emerald-50 text-emerald-600',
    'from-indigo-500/10 to-indigo-50 text-indigo-600',
    'from-violet-500/10 to-violet-50 text-violet-600'
  ];
  const colorIndex = product.name.length % colors.length;
  const gradientClass = colors[colorIndex];
  const initial = product.name.charAt(0).toUpperCase();

  return (
    <button
      onClick={() => onAdd(product)}
      className="group w-full text-left bg-white rounded-3xl p-4 border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-slate-300/60 transition-all duration-300 ease-out active:scale-[0.97] flex flex-col gap-3 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent opacity-50 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />

      <div className="flex items-start justify-between z-10">
        <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-xl font-bold border border-white/50 shadow-sm", gradientClass)}>
          {initial}
        </div>
        <div className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border border-slate-100">
          {product.sku_code}
        </div>
      </div>

      <div className="mt-2 z-10">
        <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2 pr-2">{product.name}</h3>
      </div>

      <div className="mt-auto pt-2 flex items-end justify-between z-10">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">Per {product.unit}</span>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight">
            {formatCurrency(product.price)}
          </span>
        </div>
        
        {/* Minimal Add Indicator */}
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        </div>
      </div>
    </button>
  );
}
