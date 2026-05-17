'use client';

import { Category } from '@/types/product';
import { Layout, MessageSquare, Star, Tag } from 'lucide-react';
import { memo } from 'react';

interface ProductDetailsSidebarProps {
  status: string;
  categoryId: string;
  brandId: string;
  isReview: boolean;
  isNew: boolean;
  isHot: boolean;
  isSale: boolean;
  categories: Category[];
  brands: any[];
  onUpdate: (updates: any) => void;
}

export const ProductDetailsSidebar = memo(({
  status,
  categoryId,
  brandId,
  isReview,
  isNew,
  isHot,
  isSale,
  categories,
  brands,
  onUpdate
}: ProductDetailsSidebarProps) => {
  return (
    <div className="w-full lg:w-[350px] space-y-8">
      {/* Visibility & Categorization */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Layout className="w-4 h-4" /> Visibility
          </label>
          <select
            value={status}
            onChange={(e) => onUpdate({ status: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          >
            <option value="active">Active (Visible)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => onUpdate({ categoryId: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Brand
          </label>
          <select
            value={brandId}
            onChange={(e) => onUpdate({ brandId: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          >
            <option value="">No Brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Review Mode */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Review Mode
        </label>
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => onUpdate({ isReview: !isReview })}
            className={`p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${isReview
              ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-600'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-brand-200'
              }`}
          >
            <Star className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">Enable Reviews</span>
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4" /> Product Badges
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(e) => onUpdate({ isNew: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New Arrival</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={isHot}
              onChange={(e) => onUpdate({ isHot: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Hot Product</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={isSale}
              onChange={(e) => onUpdate({ isSale: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">On Sale</span>
          </label>
        </div>
      </div>
    </div>
  );
});

ProductDetailsSidebar.displayName = 'ProductDetailsSidebar';
