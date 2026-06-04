'use client';

import type { FormEvent } from 'react';
import { Loader2, Play } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';

export interface BatchPaymentFormProps {
    selectedCount: number;
    selectedPaymentTotal: number;
    paymentMethod: string;
    transactionId: string;
    paymentNote: string;
    processing: boolean;
    onPaymentMethodChange: (value: string) => void;
    onTransactionIdChange: (value: string) => void;
    onPaymentNoteChange: (value: string) => void;
    onSubmit: () => void;
}

export default function BatchPaymentForm({
    selectedCount,
    selectedPaymentTotal,
    paymentMethod,
    transactionId,
    paymentNote,
    processing,
    onPaymentMethodChange,
    onTransactionIdChange,
    onPaymentNoteChange,
    onSubmit,
}: BatchPaymentFormProps) {
    const { formatPrice } = useSettings();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">Payment Run Config</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Pay selected bills in bulk and post GL movements</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Selected Bills:</span>
                    <span className="font-black text-slate-900 dark:text-white font-mono">{selectedCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Total Payment Run:</span>
                    <span className="font-black text-brand-600 dark:text-brand-400 font-mono text-base">
                        {formatPrice(selectedPaymentTotal)}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Payment Method</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => onPaymentMethodChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all"
                    >
                        <option>Bank Transfer</option>
                        <option>Cash</option>
                        <option>BKash / Mobile</option>
                        <option>Cheque</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Consolidated Txn ID (Optional)</label>
                    <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => onTransactionIdChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm transition-all text-slate-900 dark:text-white"
                        placeholder="e.g. BT-98127391"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Run Notes / Remarks</label>
                    <textarea
                        value={paymentNote}
                        onChange={(e) => onPaymentNoteChange(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm transition-all resize-none text-slate-900 dark:text-white"
                        placeholder="e.g. End of month payment batch run..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing || selectedCount === 0}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Executing...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Execute Payment Run
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
