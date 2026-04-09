'use client';

import ProductForm from '@/features/product/admin/ProductForm';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400 group"
          title="Go back"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Add New Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
