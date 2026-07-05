'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) {
      addToast('Failed to load products', 'error');
    } else if (data) {
      setProducts(data as Product[]);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full animate-fade-in pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <Link href="/" className="text-slate-400 hover:text-red-500 text-sm font-medium flex items-center gap-2 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your product catalog, pricing, and active status.</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="px-6 py-5 rounded-tl-3xl">SKU Code</th>
                <th className="px-6 py-5">Product Name</th>
                <th className="px-6 py-5">Unit Price</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right rounded-tr-3xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                    <span className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full mb-4"></span>
                    <p>Loading inventory...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                    <div className="text-4xl mb-3 opacity-50">📦</div>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">{product.sku_code}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800">{product.name}</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">Per {product.unit}</div>
                    </td>
                    <td className="px-6 py-5 font-extrabold text-slate-700">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                        product.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", product.is_active ? "bg-emerald-500" : "bg-slate-400")} />
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-400 font-bold hover:text-red-600 bg-white hover:bg-red-50 px-4 py-2 rounded-xl border border-slate-200 hover:border-red-100 transition-all shadow-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
