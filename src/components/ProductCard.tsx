'use client';
import React from 'react';
import { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div
      onClick={() => onAdd(product)}
      className={cn(
        'card relative overflow-hidden transition-all duration-300 card-interactive hover:border-[var(--primary)] cursor-pointer hover:shadow-md'
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-[var(--text-dark)] leading-tight">{product.name}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">{product.sku_code}</p>
        </div>
        <div className="text-right">
          <div className="font-bold text-[var(--primary)] text-lg">
            {formatCurrency(product.price)}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
             per {product.unit}
          </div>
        </div>
      </div>
    </div>
  );
}
