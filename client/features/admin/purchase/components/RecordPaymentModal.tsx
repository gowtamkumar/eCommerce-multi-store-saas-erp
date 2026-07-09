'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import type { RecordPaymentModalProps } from '../types';
import { useSettings } from '@/hooks/SettingsContext';

export default function RecordPaymentModal({
    balance,
    onClose,
    onConfirm,
}: RecordPaymentModalProps) {
    const { selectedCurrency } = useSettings();
    const currencySymbol = selectedCurrency?.symbol || '$';
    const [form, setForm] = useState({
        amount: '',
        paymentMethod: 'Bank Transfer',
        note: '',
        transactionId: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onConfirm(form);
        } finally {
            setSubmitting(false);
        }
    };

    const setFullPay = () => setForm(f => ({ ...f, amount: balance.toString() }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight">Record Payment</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            Payment Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">{currencySymbol}</span>
                            <input
                                type="number"
                                required
                                max={balance}
                                value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                className="w-full pl-10 pr-24 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-black text-xl transition-all"
                                placeholder="0.00"
                            />
                            <button
                                type="button"
                                onClick={setFullPay}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black bg-brand-100 text-brand-600 px-2 py-1 rounded-lg uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all"
                            >
                                Full Pay
                            </button>
                        </div>
                    </div>

                    {/* Method + Transaction ID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                Method
                            </label>
                            <select
                                value={form.paymentMethod}
                                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all"
                            >
                                <option>Bank Transfer</option>
                                <option>Cash</option>
                                <option>BKash / Mobile</option>
                                <option>Cheque</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                Txn ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={form.transactionId}
                                onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all"
                                placeholder="Ref No."
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            Notes
                        </label>
                        <textarea
                            value={form.note}
                            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all h-24 resize-none"
                            placeholder="Add payment details..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-3xl font-black transition-all shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                    >
                        <CheckCircle className="w-6 h-6" />
                        {submitting ? 'Processing...' : 'Confirm Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
}
