'use client';
import React from 'react';
import { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Ripple effect logic (simplified for inline)
    const button = e.currentTarget as HTMLElement;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');

    const rippleElement = button.getElementsByClassName('ripple')[0];
    if (rippleElement) {
      rippleElement.remove();
    }

    button.appendChild(circle);
    onAdd(product);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'card relative overflow-hidden transition-all duration-300 card-interactive hover:border-[var(--primary)]'
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

       <style dangerouslySetInnerHTML={{__html: `
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          background-color: rgba(220, 38, 38, 0.3); /* Primary color with opacity */
        }
      `}} />
    </div>
  );
}
