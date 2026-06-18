'use client';

import { DescriptionAiButton } from '@/features/admin/ai/components/DescriptionAiButton';
import { DiscountType } from '@/lib/enums/discount-type.enum';
import { Calendar, Percent, RefreshCw } from 'lucide-react';
import type { CouponFormFieldsProps } from '../types';

const INPUT_CLASS =
    'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none';

export default function CouponFormFields({
    formData,
    currency,
    onChange,
    onGenerateCode,
}: CouponFormFieldsProps) {
    const offerSummary =
        formData.discountType === DiscountType.FREE_SHIPPING
            ? 'Free shipping'
            : formData.discountType === DiscountType.PERCENTAGE
              ? `${formData.amount}% off`
              : `${currency} ${formData.amount} off`;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Active Status</h3>
                    <p className="text-xs text-slate-500">Enable or disable this coupon from being used.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.isActive}
                        onChange={(e) => onChange('isActive', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Coupon Code</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => onChange('code', e.target.value.toUpperCase())}
                            placeholder="e.g. SUMMER2024"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                        />
                        <button
                            type="button"
                            onClick={onGenerateCode}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium border border-slate-200 dark:border-slate-700"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Generate
                        </button>
                    </div>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-900 dark:text-white">Description (Optional)</label>
                        <DescriptionAiButton
                            name={formData.code || ''}
                            offerSummary={offerSummary}
                            context="coupon"
                            onApply={(description) => onChange('description', description)}
                        />
                    </div>
                    <input
                        type="text"
                        value={formData.description || ''}
                        onChange={(e) => onChange('description', e.target.value)}
                        placeholder="e.g. 20% off all summer items"
                        className={INPUT_CLASS}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Discount Type</label>
                    <select
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none"
                        value={formData.discountType}
                        onChange={(e) => onChange('discountType', e.target.value)}
                    >
                        <option value={DiscountType.PERCENTAGE}>Percentage (%)</option>
                        <option value={DiscountType.FIXED}>Fixed Amount ({currency})</option>
                        <option value={DiscountType.FREE_SHIPPING}>Free Shipping</option>
                    </select>
                </div>
                {formData.discountType !== DiscountType.FREE_SHIPPING && (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-900 dark:text-white">Discount Value</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => onChange('amount', Number(e.target.value))}
                                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                                placeholder="0.00"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                {formData.discountType === DiscountType.FIXED ? currency : <Percent className="w-4 h-4" />}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Min Purchase Amount</label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.minPurchaseAmount}
                            onChange={(e) => onChange('minPurchaseAmount', Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                            placeholder="Leave empty for no minimum"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                            {currency}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Usage Limit (Total)</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.usageLimit || ''}
                        onChange={(e) => onChange('usageLimit', e.target.value ? Number(e.target.value) : null)}
                        className={INPUT_CLASS}
                        placeholder="Leave empty for unlimited"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Start Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => onChange('startDate', e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Expiry Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={formData.expiryDate || ''}
                            onChange={(e) => onChange('expiryDate', e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
