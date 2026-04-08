'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import dayjs from 'dayjs';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, CreditCard, Filter, Printer, Receipt, Search, Users, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function CustomerLedger() {
    const { formatPrice } = useSettings();
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [ledgerData, setLedgerData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const res = await fetchAPI('/users?limit=100');
                setCustomers(res.data || []);
            } catch (error) {
                toast.error('Failed to load customers');
            } finally {
                setIsInitialLoading(false);
            }
        };
        loadCustomers();
    }, []);

    const fetchLedger = async (customerId: string) => {
        if (!customerId) return;
        try {
            setIsLoading(true);
            const res = await fetchAPI(`/report/customer-ledger/${customerId}`);
            setLedgerData(res.data);
        } catch (error) {
            toast.error('Failed to load ledger data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCustomerId) {
            fetchLedger(selectedCustomerId);
        }
    }, [selectedCustomerId]);

    const getStatusColor = (type: string, status?: string) => {
        if (type === 'PAYMENT') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';

        switch (status?.toUpperCase()) {
            case 'COMPLETED':
            case 'SUCCESS':
            case 'DELIVERED':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'DRAFT': return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
            case 'PENDING': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'CANCELLED': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
        }
    };

    if (isInitialLoading) {
        return <div className="p-8 text-center text-slate-500">Loading customers...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-brand-600" />
                        Customer Ledger
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track obligations and payments for your customers</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none"
                        >
                            <option value="">Select a Customer</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>{c.name || c.email}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                    {ledgerData && (
                        <button
                            onClick={() => window.print()}
                            className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title="Print Ledger"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {!selectedCustomerId ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-full">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose a Customer</h3>
                        <p className="text-slate-500 text-sm mt-1">Select a customer from the list above to view their transactional history and account balance.</p>
                    </div>
                </div>
            ) : isLoading ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                    <p>Fetching ledger records...</p>
                </div>
            ) : ledgerData ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-display">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Obligation</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(ledgerData.summary.totalOrders)}</h3>
                            <div className="flex items-center gap-2 mt-2 text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/20 w-fit px-2 py-0.5 rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                <span>Total Debits</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Settlement</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(ledgerData.summary.totalPaid)}</h3>
                            <div className="flex items-center gap-2 mt-2 text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-0.5 rounded-full">
                                <ArrowDownLeft className="w-3 h-3" />
                                <span>Total Credits</span>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border shadow-lg ${ledgerData.summary.balance > 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30'}`}>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Balance</p>
                            <h3 className={`text-2xl font-black mt-1 ${ledgerData.summary.balance > 0 ? 'text-amber-700 dark:text-amber-500' : 'text-emerald-700 dark:text-emerald-500'}`}>
                                {formatPrice(ledgerData.summary.balance)}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2">
                                {ledgerData.summary.balance > 0 ? 'Amount payable by customer' : 'All accounts settled'}
                            </p>
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Transaction History</h3>
                                <p className="text-sm text-slate-500 font-medium">{ledgerData.customer.name} • {ledgerData.customer.email}</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-black">
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Transaction Details</th>
                                        <th className="p-4 text-right">Debit (Owed)</th>
                                        <th className="p-4 text-right">Credit (Paid)</th>
                                        <th className="p-4 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {ledgerData.ledger.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No transactions found for this customer.</td>
                                        </tr>
                                    ) : (
                                        ledgerData.ledger.map((tx: any) => (
                                            <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                                                <td className="p-4 whitespace-nowrap">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{dayjs(tx.date).format('MMM D, YYYY')}</p>
                                                    <p className="text-[10px] text-slate-400">{dayjs(tx.date).format('h:mm A')}</p>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${tx.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30'}`}>
                                                            {tx.type === 'PAYMENT' ? <Wallet className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                                    {tx.type === 'PAYMENT' ? 'Payment Recorded' : 'Customer Order'}
                                                                </span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${getStatusColor(tx.type, tx.status)}`}>
                                                                    {tx.status || 'SETTLED'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Ref: {tx.reference}</p>
                                                            {tx.note && <p className="text-[10px] text-slate-400 italic mt-1 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded w-fit capitalize">Note: {tx.note}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {tx.debit > 0 ? (
                                                        <span className="text-sm font-bold text-rose-600">+{formatPrice(tx.debit)}</span>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {tx.credit > 0 ? (
                                                        <span className="text-sm font-bold text-emerald-600">-{formatPrice(tx.credit)}</span>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={`text-sm font-black ${tx.balance > 0 ? 'text-slate-900 dark:text-white' : 'text-emerald-600'}`}>
                                                        {formatPrice(tx.balance)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
