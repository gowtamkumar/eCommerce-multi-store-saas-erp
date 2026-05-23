"use client";

import { CustomizerSection } from '@/types/customizer';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import DebouncedInput from '../DebouncedInput';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';

interface BannerEditorProps {
  settings: any;
  onUpdate: (key: string, value: any) => void;
  updateArrayItem: (key: string, itemId: string, itemData: any) => void;
  addArrayItem: (key: string, defaultItem: any) => void;
  removeArrayItem: (key: string, itemId: string) => void;
}

const BannerEditor = React.memo(({ settings, onUpdate, updateArrayItem, addArrayItem, removeArrayItem }: BannerEditorProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold text-slate-500 uppercase">Banner Slides</label>

      {/* Migration Helper */}
      {(!settings?.slides || settings.slides.length === 0) && (settings?.headline || settings?.backgroundImage) && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
            Legacy banner data detected. Click to migrate to slider format.
          </p>
          <button
            onClick={() => {
              const initialSlide = {
                id: `slide-${Date.now()}`,
                headline: settings.headline,
                subline: settings.subline,
                backgroundImage: settings.backgroundImage,
                primaryButtonText: settings.primaryButtonText,
                primaryButtonLink: settings.primaryButtonLink,
                secondaryButtonText: settings.secondaryButtonText,
                secondaryButtonLink: settings.secondaryButtonLink
              };
              onUpdate('slides', [initialSlide]);
            }}
            className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs font-bold rounded-md"
          >
            Migrate Data
          </button>
        </div>
      )}

      {/* Slides List */}
      {((settings?.slides as any[]) || []).map((slide: any, index: number) => (
        <div key={slide.id || index} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-sm">
          <button
            onClick={() => toggleExpand(slide.id)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                {index + 1}
              </span>
              <span className="text-sm font-bold truncate">{slide.headline || 'New Slide'}</span>
            </div>
            {expandedItems.includes(slide.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedItems.includes(slide.id) && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
                <DebouncedInput
                  type="text"
                  value={slide.headline || ''}
                  onChange={(val) => updateArrayItem('slides', slide.id, { headline: val })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Headline"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subline</label>
                <DebouncedInput
                  as="textarea"
                  value={slide.subline || ''}
                  onChange={(val) => updateArrayItem('slides', slide.id, { subline: val })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Subtext description..."
                />
              </div>
              <div>
                <ImageUploadField
                  label="Slide Background"
                  value={slide.backgroundImage || ''}
                  onChange={(val) => updateArrayItem('slides', slide.id, { backgroundImage: val })}
                  uploadApi={fetchAPI}
                  aspectRatio="wide"
                  showUrlInput={true}
                  description="Upload slide background or paste URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Btn</label>
                  <DebouncedInput
                    type="text"
                    value={slide.primaryButtonText || ''}
                    onChange={(val) => updateArrayItem('slides', slide.id, { primaryButtonText: val })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Link</label>
                  <DebouncedInput
                    type="text"
                    value={slide.primaryButtonLink || ''}
                    onChange={(val) => updateArrayItem('slides', slide.id, { primaryButtonLink: val })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="/shop"
                  />
                </div>
              </div>

              <button
                onClick={() => removeArrayItem('slides', slide.id)}
                className="w-full py-1.5 text-[10px] font-bold text-red-500 flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-3 h-3" /> Remove Slide
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => addArrayItem('slides', {
          headline: 'New Slide',
          subline: 'Description goes here',
          backgroundImage: '',
          primaryButtonText: 'Shop Now',
          primaryButtonLink: '/products'
        })}
        className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Slide
      </button>
    </div>
  );
});

export default BannerEditor;
