'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Scale, X } from 'lucide-react';
import type { FormEvent } from 'react';
import type { TaxRuleFormData } from '../../types';

export interface TaxRuleFormModalProps {
    open: boolean;
    formData: TaxRuleFormData;
    onFieldChange: (field: keyof TaxRuleFormData, value: string) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
}

export default function TaxRuleFormModal({
    open,
    formData,
    onFieldChange,
    onClose,
    onSubmit,
}: TaxRuleFormModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                <Scale className="w-5 h-5 text-indigo-500" />
                                Configure Custom Tax Rule
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="p-8 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rule Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(event) => onFieldChange('name', event.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                                    placeholder="e.g. Sales Tax CA"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Country (ISO 2)</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={2}
                                        value={formData.country}
                                        onChange={(event) => onFieldChange('country', event.target.value.toUpperCase())}
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs uppercase"
                                        placeholder="US"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">State / Province</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(event) => onFieldChange('state', event.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                                        placeholder="CA"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rate %</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={formData.rate}
                                        onChange={(event) => onFieldChange('rate', event.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-black text-xs font-mono"
                                        placeholder="8.25"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Classification</label>
                                    <select
                                        value={formData.category}
                                        onChange={(event) => onFieldChange('category', event.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                                    >
                                        <option value="STANDARD">Standard</option>
                                        <option value="REDUCED">Reduced</option>
                                        <option value="ZERO_RATED">Zero Rated</option>
                                        <option value="EXEMPT">Exempt</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                                >
                                    Save Rule
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
