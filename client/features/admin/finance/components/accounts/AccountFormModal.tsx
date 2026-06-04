'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Scale, X } from 'lucide-react';
import type { FormEvent } from 'react';
import type { ChartAccountFormData } from '../../types';
import { ACCOUNT_CATEGORY_OPTIONS, ACCOUNT_TYPE_OPTIONS } from './accountFormOptions';

export interface AccountFormModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    accountCode?: string;
    formData: ChartAccountFormData;
    onFieldChange: (field: keyof ChartAccountFormData, value: string) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
}

export default function AccountFormModal({
    open,
    mode,
    accountCode,
    formData,
    onFieldChange,
    onClose,
    onSubmit,
}: AccountFormModalProps) {
    const isCreate = mode === 'create';

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
                        <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                <Scale className="w-5 h-5 text-indigo-500" />
                                {isCreate ? 'Add Custom Account' : `Edit Account: ${accountCode}`}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="p-8 space-y-4">
                            {isCreate && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Account Code
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => onFieldChange('code', e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono font-bold text-xs"
                                        placeholder="e.g. 6100"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Account Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => onFieldChange('name', e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                                    placeholder="e.g. Marketing Expense"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Account Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => onFieldChange('type', e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                                    >
                                        {ACCOUNT_TYPE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => onFieldChange('category', e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                                    >
                                        {ACCOUNT_CATEGORY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
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
                                    {isCreate ? 'Save Account' : 'Update Account'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
