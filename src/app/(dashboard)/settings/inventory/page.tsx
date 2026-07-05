'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', description: '', sku_code: '', price: 0, unit: 'bottle', stock_quantity: 0, is_active: true
  });

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (currentProfile) setCurrentUserRole(currentProfile.role);

      if (currentProfile?.role !== 'cashier') {
        const { data } = await supabase.from('products').select('*').order('name');
        if (data) setProducts(data as Product[]);
      }
    } catch (error) {
      addToast('Failed to load inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setFormData(product);
      setIsEditing(true);
    } else {
      setFormData({ name: '', description: '', sku_code: '', price: 0, unit: 'bottle', stock_quantity: 0, is_active: true });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing && formData.id) {
        const { error } = await supabase.from('products').update(formData).eq('id', formData.id);
        if (error) throw error;
        addToast('Product updated successfully', 'success');
      } else {
        const { error } = await supabase.from('products').insert([formData]);
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

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
      addToast('Product status updated', 'success');
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  if (isLoading) return <div className="p-8 text-center"><span className="animate-pulse">Loading inventory...</span></div>;

  if (currentUserRole === 'cashier') {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-[var(--danger)]">Access Denied</h2>
        <p className="text-[var(--text-muted)] mt-2">You do not have permission to view inventory.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-dark)]">Inventory Management</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage products, stock levels, and pricing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Add Product
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>SKU Code</th>
              <th>Product Name</th>
              <th>Unit Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={!product.is_active ? 'opacity-60 bg-gray-50' : ''}>
                <td className="font-mono text-xs text-[var(--text-muted)]">{product.sku_code}</td>
                <td className="font-medium text-[var(--text-dark)]">{product.name}</td>
                <td className="font-semibold text-[var(--primary)]">{formatCurrency(product.price)}</td>
                <td>
                  <span className={`font-bold ${product.stock_quantity <= 5 ? 'text-[var(--danger)]' : product.stock_quantity <= 20 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                    {product.stock_quantity}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-1">{product.unit}s</span>
                </td>
                <td>
                  <label className="checkbox-wrapper">
                    <input type="checkbox" checked={product.is_active} onChange={() => handleToggleStatus(product.id, product.is_active)} className="hidden" />
                    <div className={`toggle ${product.is_active ? 'active' : ''}`} />
                  </label>
                </td>
                <td>
                  <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:underline text-sm">Edit</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-[var(--text-muted)]">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal max-w-2xl">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-black">✕</button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="input-group col-span-2 md:col-span-1">
                <label>Product Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" />
              </div>
              <div className="input-group col-span-2 md:col-span-1">
                <label>SKU Code</label>
                <input type="text" required value={formData.sku_code} onChange={e => setFormData({...formData, sku_code: e.target.value})} className="input" />
              </div>
              <div className="input-group col-span-2">
                <label>Description (Optional)</label>
                <textarea rows={2} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="input" />
              </div>
              <div className="input-group col-span-2 md:col-span-1">
                <label>Price (₹)</label>
                <input type="number" required min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="input" />
              </div>
              <div className="input-group col-span-2 md:col-span-1">
                <label>Unit Type</label>
                <select required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value as any})} className="input">
                  <option value="bottle">Bottle</option>
                  <option value="ml">ml</option>
                  <option value="L">Liter</option>
                  <option value="pack">Pack</option>
                  <option value="box">Box</option>
                  <option value="piece">Piece</option>
                </select>
              </div>
              <div className="input-group col-span-2 md:col-span-1">
                <label>Stock Quantity</label>
                <input type="number" required min="0" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} className="input" />
              </div>
              
              <div className="modal-actions col-span-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary">
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
