'use client';

import React, { memo } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import DebouncedInput from '@/components/shared/DebouncedInput';

interface ProductMediaProps {
  images: string;
  onUpdate: (updates: any) => void;
}

export const ProductMedia = memo(({
  images,
  onUpdate
}: ProductMediaProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" /> Media URLs
      </label>
      <DebouncedInput
        as="textarea"
        required
        value={images}
        onChange={(val) => onUpdate({ images: val })}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-xs font-mono"
        rows={4}
        placeholder="Comma separated URLs..."
      />
      <div className="mt-4 grid grid-cols-4 gap-2">
        {images.split(',').filter(Boolean).map((url, idx) => (
          <div key={idx} className="aspect-square rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900">
            <img src={url.trim()} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/100?text=Error')} />
          </div>
        ))}
      </div>
    </div>
  );
});

ProductMedia.displayName = 'ProductMedia';
