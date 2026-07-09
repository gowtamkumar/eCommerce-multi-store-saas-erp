'use client';

import { Loader2, Minus, Plus, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useSettings } from '@/hooks/SettingsContext';
import type { WalletAdjustmentType } from '../../types';

export interface WalletAdjustmentModalProps {
    type: WalletAdjustmentType | null;
    customerName?: string;
    amount: string;
    note: string;
    submitting: boolean;
    onAmountChange: (value: string) => void;
    onNoteChange: (value: string) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
}

export default function WalletAdjustmentModal({
    type,
    customerName,
    amount,
    note,
    submitting,
    onAmountChange,
    onNoteChange,
    onClose,
    onSubmit,
}: WalletAdjustmentModalProps) {
    const { selectedCurrency } = useSettings();
    const currencySymbol = selectedCurrency.symbol;
    const currencyCode = selectedCurrency.code;

    if (!type) return null;

    const isCredit = type === 'credit';

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCredit
                                ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600'
                                : 'bg-rose-100 dark:bg-rose-950/30 text-rose-600'
                        }`}>
                            {isCredit ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white capitalize">Manual Wallet {type}</h3>
                            <p className="text-xs text-slate-500">For {customerName || 'selected customer'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Amount ({currencyCode})
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 select-none">{currencySymbol}</span>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => onAmountChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Adjustment Note / Reason</label>
                        <textarea
                            required
                            value={note}
                            onChange={(e) => onNoteChange(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm"
                            placeholder={isCredit ? 'e.g. Goodwill store credit top-up' : 'e.g. Manual correction debit'}
                            rows={3}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-all shadow-lg ${
                            isCredit
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                        }`}
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        Confirm {isCredit ? 'Credit' : 'Debit'}
                    </button>
                </form>
            </div>
        </div>
    );
}
