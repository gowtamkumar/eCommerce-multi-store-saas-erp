'use client';

import React, { memo } from 'react';
import { Layout } from 'lucide-react';
import DebouncedInput from '@/components/shared/DebouncedInput';
import RichEditor from '@/components/shared/RichEditor';

interface ProductGeneralInfoProps {
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  shortDescription: string;
  description: string;
  isEdit?: boolean;
  onUpdate: (updates: any) => void;
  generateSlug: (text: string) => string;
}

export const ProductGeneralInfo = memo(({
  name,
  slug,
  sku,
  barcode,
  shortDescription,
  description,
  isEdit,
  onUpdate,
  generateSlug
}: ProductGeneralInfoProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Layout className="w-5 h-5 text-brand-500" /> General Information
      </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Product Name</label>
          <DebouncedInput
            type="text"
            required
            placeholder="e.g. Premium Wireless Headphones"
            value={name}
            onChange={(val) => {
              if (!isEdit) {
                onUpdate({ name: val, slug: generateSlug(val) });
              } else {
                onUpdate({ name: val });
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Slug (URL)</label>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
            <span className="text-slate-400 text-sm">/products/</span>
            <DebouncedInput
              type="text"
              required
              value={slug}
              onChange={(val) => onUpdate({ slug: generateSlug(val) })}
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SKU (Stock Keeping Unit)</label>
            <DebouncedInput
              type="text"
              placeholder="e.g. PROD-001"
              value={sku}
              onChange={(val) => onUpdate({ sku: val })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Barcode (EAN / UPC / QR)</label>
            <DebouncedInput
              type="text"
              placeholder="e.g. 1234567890123"
              value={barcode}
              onChange={(val) => onUpdate({ barcode: val })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Short Description</label>
          <DebouncedInput
            as="textarea"
            value={shortDescription}
            onChange={(val) => onUpdate({ shortDescription: val })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
            rows={2}
            placeholder="A brief summary for listings..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Description</label>
          <RichEditor
            content={description}
            onChange={(content) => onUpdate({ description: content })}
            className="bg-white dark:bg-slate-900"
          />
        </div>
      </div>
    </div>
  );
});

ProductGeneralInfo.displayName = 'ProductGeneralInfo';
