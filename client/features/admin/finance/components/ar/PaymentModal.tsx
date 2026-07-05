import type { ArAgingRow } from '@/features/admin/customer/type';
import { fetchAPI } from '@/services/api';
import { CheckCircle2, DollarSign, Loader2, X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export interface PaymentModalProps {
    customer: ArAgingRow;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ customer, onClose, onSuccess }: PaymentModalProps) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            toast.error('Please enter a valid payment amount');
            return;
        }
        if (parsedAmount > customer.totalOutstanding) {
            toast.error(`Cannot pay more than outstanding balance ($${customer.totalOutstanding})`);
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetchAPI('/finance/ar/payment', {
                method: 'POST',
                body: JSON.stringify({
                    customerId: customer.customerId,
                    amount: parsedAmount,
                    paymentMethod: method,
                    transactionId: `RCPT-${Date.now()}`,
                    remarks: remarks || `Payment from ${customer.customerName}`,
                }),
            });
            if (res.success) {
                toast.success(`$${parsedAmount} payment recorded for ${customer.customerName}`);
                onSuccess();
                onClose();
            } else {
                toast.error(res.message || 'Failed to record payment');
            }
        } catch {
            toast.error('Error recording payment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Record Payment</h3>
                            <p className="text-xs text-slate-500">{customer.customerName} - Outstanding: ${Number(customer.totalOutstanding).toLocaleString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Payment Amount (USD)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={customer.totalOutstanding}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                placeholder={`Max: $${Number(customer.totalOutstanding).toLocaleString()}`}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Payment Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        >
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="CARD">Card</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Remarks (Optional)</label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            placeholder="e.g. Invoice #1234 cleared"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Confirm Payment
                    </button>
                </form>
            </div>
        </div>
    );
}
