'use client';

import React, { memo } from 'react';
import { Grid } from 'lucide-react';

interface OffersGridProps {
  productsPerRow: number;
  onUpdate: (field: string, value: any) => void;
}

export const OffersGrid = memo(({
  productsPerRow,
  onUpdate
}: OffersGridProps) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <Grid className="w-5 h-5 text-slate-400" />
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Grid Layout</h4>
      </div>

      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Products Per Row</label>
          <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold rounded-lg text-sm">
            {productsPerRow || 5}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Control the product grid density on larger screens (desktop).</p>
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
  );
});

OffersGrid.displayName = 'OffersGrid';
