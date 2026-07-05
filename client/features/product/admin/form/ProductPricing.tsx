'use client';

import React, { memo } from 'react';
import { DiscountType } from '@/lib/enums/discount-type.enum';
import { calculatePricing, formatCurrency } from '@/lib/utils';
import { useSettings } from '@/hooks/SettingsContext';
import DebouncedInput from '@/components/shared/DebouncedInput';

interface ProductPricingProps {
  price: string;
  wholesalePrice: string;
  minWholesaleQty: string;
  averageCost: string;
  discountAmount: string;
  discountType: string;
  taxRate: string;
  stock: string;
  lowStockThreshold: string;
  onUpdate: (updates: any) => void;
}

export const ProductPricing = memo(({
  price,
  wholesalePrice,
  minWholesaleQty,
  averageCost,
  discountAmount,
  discountType,
  taxRate,
  stock,
  lowStockThreshold,
  onUpdate
}: ProductPricingProps) => {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';

  const pricing = calculatePricing(
    parseFloat(price) || 0,
    parseFloat(discountAmount) || 0,
    discountType as DiscountType,
    parseFloat(taxRate) || 0
  );

  const parsedPrice = parseFloat(price) || 0;
  const parsedCost = parseFloat(averageCost) || 0;
  const grossMargin = parsedPrice > 0 
    ? (((parsedPrice - parsedCost) / parsedPrice) * 100).toFixed(1) 
    : '0.0';

  const parsedWholesalePrice = parseFloat(wholesalePrice) || 0;
  const wholesaleGrossMargin = parsedWholesalePrice > 0 
    ? (((parsedWholesalePrice - parsedCost) / parsedWholesalePrice) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-8">
      
      {/* Retail (B2C) Section */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
            Retail Configuration (B2C)
          </h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Retail Base Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currencySymbol}</span>
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
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Retail Gross Margin</label>
            <div className={`px-4 py-3 rounded-xl border border-dashed flex items-center justify-between ${Number(grossMargin) < 20 ? 'border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10'}`}>
              <span className={`text-sm font-black font-mono tracking-tighter ${Number(grossMargin) < 20 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {grossMargin}%
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Calc</span>
            </div>
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
              <option value={DiscountType.FIXED}>Fixed Amount ({currencySymbol})</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Discount Value</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                {discountType === DiscountType.PERCENTAGE ? '%' : currencySymbol}
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
              <span>Retail Base Price:</span>
              <span>{formatCurrency(parseFloat(price), currencySymbol)}</span>
            </div>
            {parseFloat(discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount ({discountType === DiscountType.PERCENTAGE ? `${discountAmount}%` : `${currencySymbol}${discountAmount}`}):</span>
                <span>-{formatCurrency(parseFloat(price) - pricing.discountedPrice, currencySymbol)}</span>
              </div>
            )}
            {parseFloat(taxRate) > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Tax ({taxRate}%):</span>
                <span>+{formatCurrency(pricing.taxAmount, currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Final Retail Price:</span>
              <span>{formatCurrency(pricing.finalPrice, currencySymbol)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Wholesale (B2B) Section */}
      <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Wholesale Configuration (B2B)
          </h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Wholesale Unit Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currencySymbol}</span>
              <DebouncedInput
                type="number"
                min="0"
                step="0.01"
                value={wholesalePrice}
                onChange={(val) => onUpdate({ wholesalePrice: val })}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Minimum Order Qty (MOQ)</label>
            <DebouncedInput
              type="number"
              min="1"
              step="1"
              value={minWholesaleQty}
              onChange={(val) => onUpdate({ minWholesaleQty: val })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-start-2">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Wholesale Gross Margin</label>
            <div className={`px-4 py-3 rounded-xl border border-dashed flex items-center justify-between ${Number(wholesaleGrossMargin) < 20 ? 'border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10' : 'border-indigo-200 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10'}`}>
              <span className={`text-sm font-black font-mono tracking-tighter ${Number(wholesaleGrossMargin) < 20 ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                {wholesaleGrossMargin}%
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Calc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Inventory & Tax Section */}
      <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-700">
        <h4 className="font-bold text-slate-900 dark:text-white">Tax & Inventory</h4>
      
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Moving Average Cost</label>
          <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-tighter">
              {formatCurrency(parsedCost, currencySymbol)}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Auto Recalc</span>
          </div>
        </div>

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
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Current Stock</label>
          <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-tighter">
              {stock || 0}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Read Only</span>
          </div>
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
    </div>
  );
});

ProductPricing.displayName = 'ProductPricing';
