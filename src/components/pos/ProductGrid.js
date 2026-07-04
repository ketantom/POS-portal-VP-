'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/useCartStore';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All Items']);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      setProducts(data);
      const uniqueCats = ['All Items', ...new Set(data.map(p => p.category || 'General'))];
      setCategories(uniqueCats);
    }
    setLoading(false);
  }

  const filteredProducts = activeCategory === 'All Items' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 className="font-bold text-gray-800 shrink-0">Catalog</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar ml-4">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                activeCategory === cat 
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start bg-gray-50/30">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold">No products found.</div>
        ) : (
          filteredProducts.map(product => (
            <button 
              key={product.sku}
              onClick={() => addItem(product)}
              className="group relative flex flex-col bg-white rounded-xl p-4 border border-gray-200 hover:border-red-300 hover:shadow-md transition-all text-left overflow-hidden h-32 transform active:scale-95"
            >
              <div className="flex-1">
                <p className="text-xs font-mono text-gray-400">{product.sku}</p>
                <h4 className="font-bold text-sm text-gray-800 mt-1 group-hover:text-red-700 transition-colors line-clamp-2">
                  {product.name}
                </h4>
              </div>
              <div className="flex items-end justify-between mt-2">
                <span className="font-extrabold text-base text-gray-900">
                  ₹{Number(product.price).toFixed(2)}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors font-bold pb-0.5">
                  +
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
