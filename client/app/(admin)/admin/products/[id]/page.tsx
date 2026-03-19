'use client';

import { fetchAPI } from '@/services/api';
import ProductForm from '@/features/admin/product/components/ProductForm';
import { use, useEffect, useState } from 'react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const resData = await fetchAPI(`/products/${id}`)
      if (resData.data) {
        setProduct(resData.data);
      }
      setLoading(false)
    }
    fetchData()
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Edit Product</h1>
      <ProductForm initialData={product} isEdit />
    </div>
  );
}

