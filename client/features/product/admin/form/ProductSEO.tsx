'use client';

import React, { memo } from 'react';
import { Search } from 'lucide-react';
import DebouncedInput from '@/components/shared/DebouncedInput';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';

interface ProductSEOProps {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  onUpdate: (updates: any) => void;
}

export const ProductSEO = memo(({
  metaTitle,
  metaDescription,
  ogImage,
  onUpdate
}: ProductSEOProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Search className="w-5 h-5 text-brand-500" /> SEO & Social Sharing
      </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Meta Title</label>
          <DebouncedInput
            type="text"
            placeholder="SEO Title"
            value={metaTitle}
            onChange={(val) => onUpdate({ metaTitle: val })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Meta Description</label>
          <DebouncedInput
            as="textarea"
            placeholder="SEO Description"
            value={metaDescription}
            onChange={(val) => onUpdate({ metaDescription: val })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
            rows={3}
          />
        </div>
        <div>
          <ImageUploadField
            label="Custom OG Image"
            value={ogImage}
            onChange={(val) => onUpdate({ ogImage: val })}
            uploadApi={fetchAPI}
            aspectRatio="wide"
            description="Social sharing open-graph image"
            showUrlInput={true}
          />
        </div>
      </div>
    </div>
  );
});

ProductSEO.displayName = 'ProductSEO';
