'use client';

import { motion } from 'framer-motion';
import { Calculator, Landmark, Loader2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useSettings } from '@/hooks/SettingsContext';
import type { TaxCalculationFormData, TaxCalculationResult } from '../../types';

type PriceFormatter = (amount: number) => string;

export interface TaxSandboxViewProps {
    formData: TaxCalculationFormData;
    result: TaxCalculationResult | null;
    calculating: boolean;
    formatPrice: PriceFormatter;
    onFieldChange: (field: keyof TaxCalculationFormData, value: string) => void;
    onSubmit: (event: FormEvent) => void;
}

export default function TaxSandboxView({
    formData,
    result,
    calculating,
    formatPrice,
    onFieldChange,
    onSubmit,
}: TaxSandboxViewProps) {
    const { selectedCurrency } = useSettings();
    const currencySymbol = selectedCurrency.symbol;
    const currencyCode = selectedCurrency.code;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 h-fit space-y-6">
                <div className="flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Tax Sandbox Calculator</h3>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Country ISO Code</label>
                        <input
                            type="text"
                            required
                            maxLength={2}
                            value={formData.country}
                            onChange={(event) => onFieldChange('country', event.target.value.toUpperCase())}
                            placeholder="e.g. BD, US, GB"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">State / Province / Region (Optional)</label>
                        <input
                            type="text"
                            value={formData.state}
                            onChange={(event) => onFieldChange('state', event.target.value)}
                            placeholder="e.g. Dhaka, NY, CA"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            Base Price / Transaction Amount ({currencyCode})
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">{currencySymbol}</span>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="1"
                                value={formData.amount}
                                onChange={(event) => onFieldChange('amount', event.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-black text-xs font-mono text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tax Classification</label>
                        <select
                            value={formData.category}
                            onChange={(event) => onFieldChange('category', event.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white"
                        >
                            <option value="STANDARD">Standard rate</option>
                            <option value="REDUCED">Reduced rate</option>
                            <option value="ZERO_RATED">Zero rated</option>
                            <option value="EXEMPT">Exempt</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={calculating}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2"
                    >
                        {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Tax Lookup'}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-6 h-full flex flex-col justify-center">
                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="p-6 rounded-4xl bg-indigo-50 border border-indigo-100 flex items-center gap-4">
                                <Landmark className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matched Rule</p>
                                    <h4 className="text-base font-black text-slate-900 uppercase">{result.ruleName}</h4>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Base Price</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{formatPrice(result.baseAmount)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Computed Regional Tax</p>
                                    <p className="text-lg font-black text-indigo-600 font-mono">+{formatPrice(result.taxAmount)} ({result.rate}%)</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Simulated Invoice Total:</span>
                                <span className="text-xl font-black text-slate-950 dark:text-white font-mono">{formatPrice(result.totalAmount)}</span>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center text-slate-400 py-12">
                            <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-xs font-black uppercase tracking-wider">Simulation Output Sandbox</p>
                            <p className="text-xs text-slate-400 font-semibold mt-1">Input values and run a lookup rule test.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
