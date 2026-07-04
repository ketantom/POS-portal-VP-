'use client';

import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Search, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function InventoryPage() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'Admin';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit state
  const [editingSku, setEditingSku] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  }

  const handleEdit = (product) => {
    setEditingSku(product.sku);
    setEditForm({ ...product });
  };

  const saveEdit = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editForm.name,
          price: parseFloat(editForm.price),
          category: editForm.category,
          updated_at: new Date().toISOString()
        })
        .eq('sku', editingSku);
        
      if (error) throw error;
      
      setProducts(products.map(p => p.sku === editingSku ? editForm : p));
      setEditingSku(null);
    } catch (err) {
      alert('Failed to update product: ' + err.message);
    }
  };

  const handleDelete = async (sku) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('sku', sku);
      if (error) throw error;
      setProducts(products.filter(p => p.sku !== sku));
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <PageLayout title="Access Denied">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <span className="text-4xl mb-4">🔒</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access Required</h2>
        </div>
      </PageLayout>
    );
  }

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout title="Manage SKUs">
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products by SKU or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-purple-500 text-sm font-medium transition-colors"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm transition">
              Bulk Import (CSV)
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/30 transition">
              <Plus className="w-4 h-4" /> New Product
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Price (₹)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">Loading inventory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">No products match your search.</td>
                </tr>
              ) : (
                filtered.map(product => {
                  const isEditing = editingSku === product.sku;
                  return (
                    <tr key={product.sku} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{product.sku}</td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editForm.name} 
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                          />
                        ) : (
                          <span className="font-bold text-gray-900 dark:text-white">{product.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editForm.category} 
                            onChange={e => setEditForm({...editForm, category: e.target.value})}
                            className="w-32 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                          />
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">{product.category || 'General'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editForm.price} 
                            onChange={e => setEditForm({...editForm, price: e.target.value})}
                            className="w-24 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-purple-500 text-right"
                          />
                        ) : (
                          <span className="font-extrabold text-gray-900 dark:text-white">₹{Number(product.price).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditingSku(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(product.sku)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
