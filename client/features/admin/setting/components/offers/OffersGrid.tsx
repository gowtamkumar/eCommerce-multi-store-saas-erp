'use client';

import React, { memo } from 'react';
import { Grid, Clock, ArrowUpDown, Eye, ToggleLeft, ToggleRight, Check } from 'lucide-react';

interface OffersGridProps {
  productsPerRow: number;
  countdownStyle?: string;
  showCartButton?: boolean;
  showOriginalPrice?: boolean;
  sortBy?: string;
  onUpdate: (field: string, value: any) => void;
}

export const OffersGrid = memo(({
  productsPerRow,
  countdownStyle = "classic",
  showCartButton = false,
  showOriginalPrice = true,
  sortBy = "ending_soon",
  onUpdate
}: OffersGridProps) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <Grid className="w-5 h-5 text-slate-400" />
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Grid & Card Styling</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products Per Row */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-900 dark:text-white">Products Per Row</label>
              <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold rounded-lg text-sm">
                {productsPerRow || 5}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Control the product grid density on desktop screens.</p>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="2"
              max="6"
              step="1"
              value={productsPerRow || 5}
              onChange={(e) => onUpdate('productsPerRow', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
            </div>
          </div>
        </div>

        {/* Default Sort Order */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-bold text-slate-900 dark:text-white">Default Sort Order</label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Choose how promotional offers are sorted on the storefront page.</p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onUpdate('sortBy', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-xs font-bold"
          >
            <option value="ending_soon">⏳ Ending Soonest First</option>
            <option value="newest">🔥 Newest Added First</option>
            <option value="discount_desc">📈 Highest Discount Value First</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Countdown Timer Style */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-bold text-slate-900 dark:text-white">Countdown Timer Style</label>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure visual layout for promotion countdown clocks.</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "classic", label: "Classic", desc: "Clock boxes" },
              { key: "compact", label: "Compact", desc: "Sleek text" },
              { key: "hidden", label: "Hidden", desc: "Hide timer" }
            ].map((style) => (
              <button
                key={style.key}
                type="button"
                onClick={() => onUpdate("countdownStyle", style.key)}
                className={`py-2 px-1 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1 ${
                  countdownStyle === style.key
                    ? "border-brand-500 bg-brand-50/50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950 text-slate-500 hover:text-slate-700"
                }`}
              >
                <span className="text-xs font-bold">{style.label}</span>
                <span className="text-[8px] opacity-70 font-semibold">{style.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card Interactive Toggles */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-bold text-slate-900 dark:text-white">Product Card Elements</label>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Toggle active display parameters inside item listing frames.</p>
          
          <div className="space-y-3">
            {/* Show Add to Cart Button */}
            <div
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
              onClick={() => onUpdate("showCartButton", !showCartButton)}
            >
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Show Direct Purchase Button</h5>
                <p className="text-[9px] text-slate-400">Adds an add-to-cart call to action overlay.</p>
              </div>
              {showCartButton ? (
                <ToggleRight className="w-6 h-6 text-brand-500 shrink-0" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-400 shrink-0" />
              )}
            </div>

            {/* Show Original Price */}
            <div
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
              onClick={() => onUpdate("showOriginalPrice", !showOriginalPrice)}
            >
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Show Original Price Markup</h5>
                <p className="text-[9px] text-slate-400">Display original compare-at pricing crossed out.</p>
              </div>
              {showOriginalPrice ? (
                <ToggleRight className="w-6 h-6 text-brand-500 shrink-0" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-400 shrink-0" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OffersGrid.displayName = 'OffersGrid';
