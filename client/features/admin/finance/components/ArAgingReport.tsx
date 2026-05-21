'use client';

import { fetchAPI } from '@/services/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { ArAgingRow } from '@/features/admin/customer/type';
import {
    AlertTriangle, CheckCircle2, CreditCard, DollarSign, Loader2,
    RefreshCw, Search, TrendingDown, TrendingUp, X, FileText
} from 'lucide-react';

function AgingBadge({ days, amount }: { days: string; amount: number }) {
    const colorMap: Record<string, string> = {
        'Current': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        '1-30': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        '31-60': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        '61-90': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        '90+': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-black',
    };
    if (amount === 0) return <span className="text-slate-400 text-sm">—</span>;
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colorMap[days] || ''}`}>
            ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
    );
}

interface PaymentModalProps {
    customer: ArAgingRow;
    onClose: () => void;
    onSuccess: () => void;
}

function PaymentModal({ customer, onClose, onSuccess }: PaymentModalProps) {
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
                            <p className="text-xs text-slate-500">{customer.customerName} — Outstanding: ${Number(customer.totalOutstanding).toLocaleString()}</p>
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

export default function ArAgingPage() {
    const [rows, setRows] = useState<ArAgingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [payingCustomer, setPayingCustomer] = useState<ArAgingRow | null>(null);

    const fetchAging = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/finance/ar/aging');
            if (res.success) setRows(res.data || []);
        } catch {
            toast.error('Failed to load AR aging report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAging(); }, []);

    const filtered = rows.filter(r =>
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        r.customerEmail.toLowerCase().includes(search.toLowerCase())
    );

    const totalOutstanding = rows.reduce((s, r) => s + Number(r.totalOutstanding), 0);
    const totalOverdue = rows.reduce((s, r) => s + r.aging['1-30'] + r.aging['31-60'] + r.aging['61-90'] + r.aging['90+'], 0);
    const holdCount = rows.filter(r => r.creditHold).length;

    return (
        <div className="space-y-6 pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Accounts Receivable</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">B2B customer debt aging, credit limits, and payment collection</p>
                </div>
                <button
                    onClick={fetchAging}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-semibold disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Outstanding</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                        ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{rows.length} active B2B accounts</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Overdue</p>
                    </div>
                    <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                        ${totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Past due invoices (1-30, 31-60, 61-90, 90+ days)</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${holdCount > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                            <AlertTriangle className={`w-5 h-5 ${holdCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Credit Hold</p>
                    </div>
                    <p className={`text-2xl font-black font-mono ${holdCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {holdCount} accounts
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Blocked from on-account purchases</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search customer, company, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                />
            </div>

            {/* Aging Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Customer / Company</th>
                                <th className="px-6 py-4 text-right">Outstanding</th>
                                <th className="px-6 py-4 text-center">Current</th>
                                <th className="px-6 py-4 text-center">1–30 Days</th>
                                <th className="px-6 py-4 text-center">31–60 Days</th>
                                <th className="px-6 py-4 text-center">61–90 Days</th>
                                <th className="px-6 py-4 text-center">90+ Days</th>
                                <th className="px-6 py-4 text-center">Credit Limit</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="flex justify-center items-center gap-2 text-slate-500">
                                            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                                            Loading aging report...
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <FileText className="w-10 h-10 opacity-40" />
                                            <p className="text-sm font-medium">No outstanding AR balances found</p>
                                            <p className="text-xs">All B2B accounts are fully settled</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((row) => {
                                    const utilization = row.creditLimit > 0 ? (row.totalOutstanding / row.creditLimit) * 100 : 0;
                                    return (
                                        <tr key={row.customerId} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{row.customerName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{row.companyName || row.customerEmail}</p>
                                                {row.creditHold && (
                                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                                        <AlertTriangle className="w-2.5 h-2.5" /> Credit Hold
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-black text-slate-900 dark:text-white text-sm font-mono">
                                                    ${Number(row.totalOutstanding).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                {row.creditLimit > 0 && (
                                                    <div className="mt-1">
                                                        <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full ml-auto overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${utilization >= 90 ? 'bg-rose-500' : utilization >= 70 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                                                style={{ width: `${Math.min(utilization, 100)}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 text-right mt-0.5">{utilization.toFixed(0)}% of ${Number(row.creditLimit).toLocaleString()}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center"><AgingBadge days="Current" amount={row.aging.current} /></td>
                                            <td className="px-6 py-4 text-center"><AgingBadge days="1-30" amount={row.aging['1-30']} /></td>
                                            <td className="px-6 py-4 text-center"><AgingBadge days="31-60" amount={row.aging['31-60']} /></td>
                                            <td className="px-6 py-4 text-center"><AgingBadge days="61-90" amount={row.aging['61-90']} /></td>
                                            <td className="px-6 py-4 text-center"><AgingBadge days="90+" amount={row.aging['90+']} /></td>
                                            <td className="px-6 py-4 text-center">
                                                {row.creditLimit > 0
                                                    ? <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 font-mono">${Number(row.creditLimit).toLocaleString()}</span>
                                                    : <span className="text-slate-400 text-sm">—</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setPayingCustomer(row)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm ml-auto"
                                                >
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    Pay
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            {payingCustomer && (
                <PaymentModal
                    customer={payingCustomer}
                    onClose={() => setPayingCustomer(null)}
                    onSuccess={fetchAging}
                />
            )}
        </div>
    );
}
