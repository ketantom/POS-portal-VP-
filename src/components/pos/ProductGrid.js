'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/useCartStore';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      setProducts(data);
      const uniqueCats = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats);
    }
    setLoading(false);
  }

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 font-bold">Loading products...</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Catalog</h2>
      </div>
      
      {/* Categories */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex gap-2 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.sku}
              onClick={() => addItem(product)}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col justify-between hover:border-red-400 hover:shadow-md cursor-pointer transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-red-500 mb-1">{product.category}</div>
                <h3 className="font-bold text-gray-800 leading-tight mb-2 group-hover:text-red-600 transition-colors">{product.name}</h3>
              </div>
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                <span className="font-black text-gray-900">₹{Number(product.price).toFixed(2)}</span>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{product.stock_quantity} in stock</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
