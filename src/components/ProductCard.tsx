'use client';
import React from 'react';
import { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  // Generate a consistent vibrant color based on the product name length
  const colors = [
    'from-red-500 to-rose-400 text-white',
    'from-orange-500 to-amber-400 text-white',
    'from-emerald-500 to-teal-400 text-white',
    'from-blue-500 to-indigo-400 text-white',
    'from-purple-500 to-fuchsia-400 text-white'
  ];
  const colorIndex = product.name.length % colors.length;
  const gradientClass = colors[colorIndex];
  const initial = product.name.charAt(0).toUpperCase();

  return (
    <div
      onClick={() => onAdd(product)}
      className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] hover:-translate-y-1 overflow-hidden"
    >
      {/* Vibrant Header Placeholder */}
      <div className={cn("h-28 w-full bg-gradient-to-tr flex items-center justify-center relative overflow-hidden", gradientClass)}>
         <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
         <span className="text-4xl font-extrabold opacity-90 drop-shadow-md z-10">{initial}</span>
         {/* Decorative circles */}
         <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/20 rounded-full blur-sm" />
         <div className="absolute top-2 -left-4 w-12 h-12 bg-white/20 rounded-full blur-sm" />
      </div>
      
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">{product.name}</h3>
          <p className="text-xs text-slate-400 mt-1.5 font-medium tracking-wide uppercase">{product.sku_code}</p>
        </div>
        
        <div className="mt-4 flex items-end justify-between">
          <div>
             <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Per {product.unit}</div>
             <div className="font-extrabold text-slate-800 text-lg sm:text-xl">
               {formatCurrency(product.price)}
             </div>
          </div>
          <div className="bg-red-50 text-red-600 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md flex-shrink-0 group-hover:scale-110">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
