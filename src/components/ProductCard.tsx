'use client';
import React from 'react';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div
      onClick={() => onAdd(product)}
      className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[160px] hover:-translate-y-1 overflow-hidden"
    >
      {/* Decorative gradient splash */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-50 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-125 duration-500" />
      
      <div className="relative z-10">
        <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-snug line-clamp-2">{product.name}</h3>
        <p className="text-xs text-slate-400 mt-1 font-medium">{product.sku_code}</p>
      </div>
      
      <div className="mt-4 flex items-end justify-between relative z-10">
        <div>
           <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Price per {product.unit}</div>
           <div className="font-extrabold text-red-600 text-lg sm:text-xl">
             {formatCurrency(product.price)}
           </div>
        </div>
        <div className="bg-red-50 text-red-600 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-sm flex-shrink-0">
           <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        </div>
      </div>
    </div>
  );
}
