'use client';

import React, { memo } from 'react';
import { Type, Layout, ToggleLeft, ToggleRight } from 'lucide-react';
import DebouncedInput from '@/components/shared/DebouncedInput';

interface OffersBannerProps {
  bannerShow: boolean;
  bannerHeadline: string;
  bannerSubheadline: string;
  bannerImage: string;
  bannerBackgroundColor: string;
  bannerTextColor: string;
  bannerHeight: number;
  bannerFullWidth: boolean;
  onUpdate: (field: string, value: any) => void;
}

export const OffersBanner = memo(({
  bannerShow,
  bannerHeadline,
  bannerSubheadline,
  bannerImage,
  bannerBackgroundColor,
  bannerTextColor,
  bannerHeight,
  bannerFullWidth,
  onUpdate
}: OffersBannerProps) => {
  return (
    <div className={`bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 transition-all ${!bannerShow ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : ''}`}>
      <div className="flex items-center gap-3 mb-6">
        <Type className="w-5 h-5 text-slate-400" />
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Banner Content & Styling</h4>
      </div>

      <div className="space-y-8">
        {/* Basic Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Banner Headline
            </label>
            <DebouncedInput
              type="text"
              value={bannerHeadline || ""}
              onChange={(val) => onUpdate('bannerHeadline', val)}
              placeholder="e.g. 🔥 Special Deals & Offers"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Banner Subheadline
            </label>
            <DebouncedInput
              type="text"
              value={bannerSubheadline || ""}
              onChange={(val) => onUpdate('bannerSubheadline', val)}
              placeholder="e.g. Save big on our hottest promotions..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Image & Background */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Banner Image URL
            </label>
            <DebouncedInput
              type="text"
              value={bannerImage || ""}
              onChange={(val) => onUpdate('bannerImage', val)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1 italic">Leave empty to use default gradient background.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                BG Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bannerBackgroundColor || "#0f172a"}
                  onChange={(e) => onUpdate('bannerBackgroundColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                />
                <DebouncedInput
                  type="text"
                  value={bannerBackgroundColor || ""}
                  onChange={(val) => onUpdate('bannerBackgroundColor', val)}
                  placeholder="#0f172a"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bannerTextColor || "#ffffff"}
                  onChange={(e) => onUpdate('bannerTextColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                />
                <DebouncedInput
                  type="text"
                  value={bannerTextColor || ""}
                  onChange={(val) => onUpdate('bannerTextColor', val)}
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Banner Height</label>
              <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold rounded-lg text-sm">
                {bannerHeight || 400}px
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="800"
              step="50"
              value={bannerHeight || 400}
              onChange={(e) => onUpdate('bannerHeight', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-2">
              <span>Short (200px)</span>
              <span>Tall (800px)</span>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${bannerFullWidth ? 'border-brand-500 bg-brand-50/50 text-brand-900 dark:text-white dark:bg-brand-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80 hover:opacity-100'}`}
            onClick={() => onUpdate('bannerFullWidth', !bannerFullWidth)}
          >
            <div className={`p-2 rounded-xl ${bannerFullWidth ? 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <Layout className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-sm">Full Width Banner</h5>
              <p className="text-[10px] text-slate-500">Make the banner bleed to the edges of the screen.</p>
            </div>
            {bannerFullWidth ? (
              <ToggleRight className="w-6 h-6 text-brand-500" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

OffersBanner.displayName = 'OffersBanner';
