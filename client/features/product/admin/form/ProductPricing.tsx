'use client';

import React, { memo } from 'react';
import { DiscountType } from '@/lib/enums/discount-type.enum';
import { calculatePricing } from '@/lib/utils';
import DebouncedInput from '@/components/shared/DebouncedInput';

interface ProductPricingProps {
  price: string;
  discountAmount: string;
  discountType: string;
  taxRate: string;
  stock: string;
  lowStockThreshold: string;
  onUpdate: (updates: any) => void;
}

export const ProductPricing = memo(({
  price,
  discountAmount,
  discountType,
  taxRate,
  stock,
  lowStockThreshold,
  onUpdate
}: ProductPricingProps) => {
  const pricing = calculatePricing(
    parseFloat(price) || 0,
    parseFloat(discountAmount) || 0,
    discountType as DiscountType,
    parseFloat(taxRate) || 0
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6">
      <h4 className="font-bold text-slate-900 dark:text-white">Pricing & Inventory</h4>
      
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Base Price</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <DebouncedInput
            type="number"
            required
            min="0"
            step="0.01"
            value={price}
            onChange={(val) => onUpdate({ price: val })}
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Discount Type</label>
          <select
            value={discountType}
            onChange={(e) => onUpdate({ discountType: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          >
            <option value={DiscountType.PERCENTAGE}>Percentage (%)</option>
            <option value={DiscountType.FIXED}>Fixed Amount ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Discount Value</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
              {discountType === DiscountType.PERCENTAGE ? '%' : '$'}
            </span>
            <DebouncedInput
              type="number"
              min="0"
              step={discountType === DiscountType.PERCENTAGE ? '1' : '0.01'}
              max={discountType === DiscountType.PERCENTAGE ? '100' : undefined}
              value={discountAmount}
              onChange={(val) => onUpdate({ discountAmount: val })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all font-mono"
            />
          </div>
        </div>
      </div>

      {pricing.price > 0 && (parseFloat(discountAmount) > 0 || parseFloat(taxRate) > 0) && (
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between">
            <span>Base Price:</span>
            <span>${parseFloat(price).toFixed(2)}</span>
          </div>
          {parseFloat(discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Discount ({discountType === DiscountType.PERCENTAGE ? `${discountAmount}%` : `$${discountAmount}`}):</span>
              <span>-${(parseFloat(price) - pricing.discountedPrice).toFixed(2)}</span>
            </div>
          )}
          {parseFloat(taxRate) > 0 && (
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>Tax ({taxRate}%):</span>
              <span>+${pricing.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
            <span>Final Price:</span>
            <span>${pricing.finalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tax Rate (%)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">%</span>
            <DebouncedInput
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate}
              onChange={(val) => onUpdate({ taxRate: val })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all font-mono"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Stock Quantity</label>
          <DebouncedInput
            type="number"
            required
            min="0"
            value={stock}
            onChange={(val) => onUpdate({ stock: val })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Low Stock Alert Threshold</label>
        <DebouncedInput
          type="number"
          required
          min="0"
          value={lowStockThreshold}
          onChange={(val) => onUpdate({ lowStockThreshold: val })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all"
        />
        <p className="mt-2 text-[10px] text-slate-400 leading-relaxed italic">
          * You will receive an alert when stock drops to or below this level.
        </p>
      </div>
    </div>
  );
});

ProductPricing.displayName = 'ProductPricing';
