'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Upload, Trash2, Edit2, X, Download } from 'lucide-react';
import Papa from 'papaparse';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku_code: '',
    price: '',
    unit: 'bottle',
    is_active: true
  });

  const { addToast } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        sku_code: product.sku_code,
        price: product.price.toString(),
        unit: product.unit,
        is_active: product.is_active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        sku_code: `SKU-${Math.floor(Math.random() * 10000)}`,
        price: '',
        unit: 'bottle',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        sku_code: formData.sku_code,
        price: parseFloat(formData.price),
        unit: formData.unit,
        is_active: formData.is_active
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        addToast('Product updated successfully', 'success');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        addToast('Product added successfully', 'success');
      }
      
      setShowModal(false);
      loadProducts();
    } catch (error: any) {
      addToast(error.message || 'Failed to save product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      addToast('Product deleted successfully', 'success');
      loadProducts();
    } catch (error: any) {
      addToast(error.message || 'Failed to delete product', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          const productsToInsert = rows.map(row => ({
            name: row.name,
            sku_code: row.sku_code,
            price: parseFloat(row.price),
            unit: row.unit || 'bottle',
            is_active: row.is_active !== 'FALSE' && row.is_active !== 'false'
          })).filter(p => p.name && p.sku_code && !isNaN(p.price));

          if (productsToInsert.length === 0) {
            addToast('No valid products found in CSV', 'warning');
            return;
          }

          const { error } = await supabase.from('products').upsert(productsToInsert, { onConflict: 'sku_code' });
          if (error) throw error;
          
          addToast(`Successfully imported ${productsToInsert.length} products`, 'success');
          loadProducts();
        } catch (error: any) {
          addToast(error.message || 'Failed to import CSV', 'error');
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: () => {
        addToast('Failed to parse CSV file', 'error');
      }
    });
  };

  const downloadCsvTemplate = () => {
    const csvContent = "name,sku_code,price,unit,is_active\nExample Juice,SKU-001,150,bottle,TRUE\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "product_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full animate-fade-in pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <Link href="/" className="text-slate-400 hover:text-rose-500 text-sm font-medium flex items-center gap-2 mb-4 transition-colors w-max">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">Manage your product catalog, pricing, and active status.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl font-bold shadow-sm border border-slate-200 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            CSV Import
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-2xl font-bold shadow-[0_4px_14px_rgb(225,29,72,0.3)] hover:shadow-[0_6px_20px_rgb(225,29,72,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                <th className="px-6 py-5 rounded-tl-3xl">Product</th>
                <th className="px-6 py-5">SKU Code</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right rounded-tr-3xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-400 font-medium">
                    <span className="animate-spin inline-block w-8 h-8 border-4 border-slate-100 border-t-rose-500 rounded-full mb-4"></span>
                    <p className="text-sm">Loading catalog...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-400 font-medium">
                    <div className="text-4xl mb-3 opacity-50">📦</div>
                    <p className="text-sm">No products found.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{product.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Per {product.unit}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">{product.sku_code}</span>
                    </td>
                    <td className="px-6 py-5 font-extrabold text-slate-800 text-sm">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        product.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", product.is_active ? "bg-emerald-500" : "bg-slate-400")} />
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative border border-white/20 animate-scale-in">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-8">
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all font-medium text-slate-800 shadow-sm" placeholder="e.g. Kokam Sarbat" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SKU Code</label>
                    <input required type="text" value={formData.sku_code} onChange={e => setFormData({...formData, sku_code: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all font-medium text-slate-800 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (₹)</label>
                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all font-medium text-slate-800 shadow-sm" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unit</label>
                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all font-medium text-slate-800 shadow-sm appearance-none cursor-pointer">
                      <option value="bottle">Bottle</option>
                      <option value="pack">Pack</option>
                      <option value="box">Box</option>
                      <option value="piece">Piece</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={cn("w-10 h-6 rounded-full transition-colors relative shadow-inner", formData.is_active ? "bg-emerald-500" : "bg-slate-200")}>
                      <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm", formData.is_active ? "left-5" : "left-1")} />
                    </div>
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="hidden" />
                  </label>
                  <span className="text-sm font-bold text-slate-700">Active Product</span>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-3 text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-[0_4px_14px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center">
                    {isSaving ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
            {!editingProduct && (
              <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                <button onClick={downloadCsvTemplate} className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1.5 mx-auto">
                  <Download className="w-3.5 h-3.5" /> Download CSV Template for Bulk Upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
