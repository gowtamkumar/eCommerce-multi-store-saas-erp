'use client';

import { DescriptionAiButton } from '@/features/admin/ai/components/DescriptionAiButton';
import { PromotionTargetType } from '@/lib/enums/promotion-target-type.enum';
import { PromotionType } from '@/lib/enums/promotion-type.enum';
import { Calendar, Check, Copy, Percent } from 'lucide-react';
import React from 'react';
import type { PromotionFormFieldsProps } from '../types';

const TARGET_TYPES_WITH_OPTIONS = [
    PromotionTargetType.SPECIFIC_BRAND,
    PromotionTargetType.SPECIFIC_CATEGORY,
    PromotionTargetType.SPECIFIC_PRODUCT,
];

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm';
const selectClass = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm';
const labelClass = 'text-sm font-semibold text-slate-900 dark:text-white';

const PromotionFormFields: React.FC<PromotionFormFieldsProps> = ({
    formData,
    currency,
    brands,
    categories,
    products,
    copied,
    onNameChange,
    onSlugChange,
    onFieldChange,
    onCopyLink,
}) => {
    const targetOptions = formData.targetType === PromotionTargetType.SPECIFIC_BRAND
        ? brands
        : formData.targetType === PromotionTargetType.SPECIFIC_CATEGORY
            ? categories
            : products;

    const offerSummary =
        formData.promotionType === PromotionType.FREE_SHIPPING
            ? 'Free shipping'
            : formData.promotionType === PromotionType.PERCENTAGE
              ? `${formData.value}% off`
              : `${currency} ${formData.value} off`;

    return (
        <>
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Active Status</h3>
                    <p className="text-xs text-slate-500">Enable or disable this promotional offer.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.isActive}
                        onChange={(e) => onFieldChange('isActive', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={labelClass}>Promotion Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="e.g. Summer Brand Sale"
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white flex justify-between items-center">
                        Slug (URL identifier)
                        {formData.slug && (
                            <button
                                type="button"
                                onClick={onCopyLink}
                                className="text-[10px] uppercase tracking-wider font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        )}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={formData.slug}
                            onChange={(e) => onSlugChange(e.target.value)}
                            placeholder="summer-brand-sale"
                            className={`${inputClass} pr-10`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">/offers/</span>
                    </div>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>Description (Optional)</label>
                        <DescriptionAiButton
                            name={formData.name}
                            offerSummary={offerSummary}
                            context="promotion"
                            onApply={(description) => onFieldChange('description', description)}
                        />
                    </div>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => onFieldChange('description', e.target.value)}
                        placeholder="Internal notes or public description"
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={labelClass}>Discount Type</label>
                    <select
                        className={selectClass}
                        value={formData.promotionType}
                        onChange={(e) => onFieldChange('promotionType', e.target.value as PromotionType)}
                    >
                        <option value={PromotionType.PERCENTAGE}>Percentage (%)</option>
                        <option value={PromotionType.FIXED}>Fixed Amount ({currency})</option>
                        <option value={PromotionType.FREE_SHIPPING}>Free Shipping</option>
                    </select>
                </div>

                {formData.promotionType !== PromotionType.FREE_SHIPPING && (
                    <div className="space-y-2">
                        <label className={labelClass}>Discount Value</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => onFieldChange('value', e.target.value)}
                                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                placeholder="0.00"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                {formData.promotionType === PromotionType.FIXED ? currency : <Percent className="w-4 h-4" />}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={labelClass}>Applies To</label>
                    <select
                        className={selectClass}
                        value={formData.targetType}
                        onChange={(e) => {
                            onFieldChange('targetType', e.target.value as PromotionTargetType);
                            onFieldChange('targetId', '');
                        }}
                    >
                        <option value={PromotionTargetType.ENTIRE_ORDER}>Entire Order</option>
                        <option value={PromotionTargetType.MINIMUM_CART_VALUE}>Minimum Cart Value</option>
                        <option value={PromotionTargetType.SPECIFIC_PRODUCT}>Specific Product</option>
                        <option value={PromotionTargetType.SPECIFIC_CATEGORY}>Specific Category</option>
                        <option value={PromotionTargetType.SPECIFIC_BRAND}>Specific Brand</option>
                    </select>
                </div>

                {TARGET_TYPES_WITH_OPTIONS.includes(formData.targetType) && (
                    <div className="space-y-2">
                        <label className={labelClass}>Target Selection</label>
                        <select
                            required
                            className={selectClass}
                            value={formData.targetId}
                            onChange={(e) => onFieldChange('targetId', e.target.value)}
                        >
                            <option value="">Select Target...</option>
                            {targetOptions.map((option) => (
                                <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {formData.targetType === PromotionTargetType.MINIMUM_CART_VALUE && (
                    <div className="space-y-2">
                        <label className={labelClass}>Minimum Order Value</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.minOrderValue}
                                onChange={(e) => onFieldChange('minOrderValue', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                                placeholder="0.00"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                {currency}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={labelClass}>Start Date (Optional)</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => onFieldChange('startDate', e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={labelClass}>Expiry Date (Optional)</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => onFieldChange('endDate', e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PromotionFormFields;
