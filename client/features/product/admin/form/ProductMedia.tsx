'use client';

import React, { memo } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';

interface ProductMediaProps {
  images: string;
  onUpdate: (updates: any) => void;
}

export const ProductMedia = memo(({
  images,
  onUpdate
}: ProductMediaProps) => {
  const imageUrlList = images ? images.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const handleAddImage = (newUrl: string) => {
    if (!newUrl) return;
    const updated = [...imageUrlList, newUrl].join(',');
    onUpdate({ images: updated });
  };

  const handleRemoveImage = (index: number) => {
    const updated = imageUrlList.filter((_, idx) => idx !== index).join(',');
    onUpdate({ images: updated });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Media URLs
        </label>
        <span className="text-xs text-slate-500">{imageUrlList.length} images</span>
      </div>

      {/* Grid of uploaded images */}
      {imageUrlList.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {imageUrlList.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/100?text=Error')} />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-md transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Single uploader field that appends to list */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
        <ImageUploadField
          label="Add Product Image"
          onChange={handleAddImage}
          uploadApi={fetchAPI}
          aspectRatio="wide"
          showUrlInput={true}
          description="Upload or paste image URL to add to product media"
        />
      </div>
    </div>
  );
});

ProductMedia.displayName = 'ProductMedia';
