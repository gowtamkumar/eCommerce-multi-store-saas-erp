'use client';

import { Award, RefreshCw, X } from 'lucide-react';
import type { LoyaltyRuleModalProps, LoyaltyRuleType } from '../types';
import { LoyaltyRuleAiAssist } from './LoyaltyRuleAiAssist';

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-semibold';
const labelClass = 'text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400';

export default function LoyaltyRuleModal({
    editingRule,
    formData,
    submitting,
    currencyCode,
    currencySymbol,
    formatPrice,
    onFieldChange,
    onClose,
    onSubmit,
}: LoyaltyRuleModalProps) {
    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center text-brand-600">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                {editingRule ? 'Edit Loyalty Rule' : 'Create Loyalty Rule'}
                            </h3>
                            <p className="text-xs text-slate-500">Configure parameters for custom point evaluations</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <LoyaltyRuleAiAssist
                        ruleType={formData.type}
                        value={formData.value}
                        categoryId={formData.categoryId}
                        minSpend={formData.minSpend}
                        formatPrice={formatPrice}
                        onApply={(name) => onFieldChange('name', name)}
                    />

                    <div className="space-y-1.5">
                        <label className={labelClass}>Rule Name</label>
                        <input
                            required
                            type="text"
                            placeholder="E.g., Double Points for Electronics"
                            value={formData.name}
                            onChange={(event) => onFieldChange('name', event.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelClass}>Rule Type</label>
                        <select
                            value={formData.type}
                            onChange={(event) => onFieldChange('type', event.target.value as LoyaltyRuleType)}
                            className={inputClass}
                        >
                            <option value="CATEGORY_MULTIPLIER">Category Multiplier</option>
                            <option value="MIN_SPEND_BONUS">Min Spend Bonus</option>
                            <option value="WEEKEND_MULTIPLIER">Weekend Multiplier</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelClass}>
                            {formData.type === 'MIN_SPEND_BONUS' ? 'Bonus Points Amount' : 'Multiplier Value (e.g. 1.5, 2.0)'}
                        </label>
                        <input
                            required
                            type="number"
                            step={formData.type === 'MIN_SPEND_BONUS' ? '1' : '0.05'}
                            min="0.1"
                            value={formData.value}
                            onChange={(event) => onFieldChange('value', Number(event.target.value))}
                            className={`${inputClass} font-mono`}
                        />
                    </div>

                    {formData.type === 'CATEGORY_MULTIPLIER' && (
                        <div className="space-y-1.5">
                            <label className={labelClass}>Category ID (UUID)</label>
                            <input
                                required
                                type="text"
                                placeholder="Enter category UUID..."
                                value={formData.categoryId}
                                onChange={(event) => onFieldChange('categoryId', event.target.value)}
                                className={`${inputClass} font-mono`}
                            />
                        </div>
                    )}

                    {formData.type === 'MIN_SPEND_BONUS' && (
                        <div className="space-y-1.5">
                            <label className={labelClass}>Min Spend Threshold ({currencyCode})</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 select-none">{currencySymbol}</span>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.minSpend}
                                    onChange={(event) => onFieldChange('minSpend', Number(event.target.value))}
                                    className={`${inputClass} font-mono pl-10`}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Start Date (Optional)</label>
                            <input
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(event) => onFieldChange('startDate', event.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>End Date (Optional)</label>
                            <input
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(event) => onFieldChange('endDate', event.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="space-y-0.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-950 dark:text-white">Active Status</label>
                            <p className="text-[10px] text-slate-400">Active rules will apply during checkout.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onFieldChange('isActive', !formData.isActive)}
                            className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-1 ${formData.isActive ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-brand-500/10 uppercase tracking-wider"
                        >
                            {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                            {editingRule ? 'Save Changes' : 'Create Rule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
