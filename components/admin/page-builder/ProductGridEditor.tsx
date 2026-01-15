"use client";

import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from 'react';

interface ProductGridEditorProps {
  content: any;
  onUpdate: (key: string, value: any) => void;
}

export default function ProductGridEditor({ content, onUpdate }: ProductGridEditorProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(content?.productIds || []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetchAPI('/products');
      if (res.success && res.data) {
        const productList = Array.isArray(res.data) ? res.data : res.data.products || [];
        setProducts(productList);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];

    setSelectedProducts(newSelection);
    onUpdate('productIds', newSelection);
  };

  const selectAll = () => {
    const allIds = products.map(p => p._id);
    setSelectedProducts(allIds);
    onUpdate('productIds', allIds);
  };

  const clearAll = () => {
    setSelectedProducts([]);
    onUpdate('productIds', []);
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        No products found. Create products first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
          Select Products ({selectedProducts.length} selected)
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs px-3 py-1 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        {products.map((product) => (
          <label
            key={product._id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedProducts.includes(product._id)}
              onChange={() => toggleProduct(product._id)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div className="flex-1">
              <p className="font-medium text-sm text-slate-900 dark:text-white">
                {product.name}
              </p>
              <p className="text-xs text-slate-500">
                ${product.price || '0.00'}
              </p>
            </div>
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-10 h-10 rounded object-cover"
              />
            )}
          </label>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Selected products will be displayed in a grid on the frontend
      </p>
    </div>
  );
}
