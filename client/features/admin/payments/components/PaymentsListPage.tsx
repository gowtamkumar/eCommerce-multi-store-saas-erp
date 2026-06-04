'use client';

import React, { useMemo } from 'react';
import { Search, Wallet, CheckCircle, Clock } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import type { Payment, PaymentListPageProps } from '../types';

export function PaymentsListPage({
    payments,
    loading,
    searchQuery,
    onSearchQueryChange,
    pagination,
    onPageChange
}: PaymentListPageProps) {
    const { formatPrice } = useSettings();

    // Derive simple stats from current payments page
    const stats = useMemo(() => {
        const totalAmount = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const successCount = payments.filter(p => p.status === 'completed' || p.status === 'SUCCESS').length;
        const successRate = payments.length > 0 ? Math.round((successCount / payments.length) * 100) : 0;
        
        return {
            pageVolume: totalAmount,
            successRate,
            pendingCount: payments.filter(p => p.status === 'pending' || p.status === 'PENDING').length
        };
    }, [payments]);

    const columns = useMemo<DataTableColumn<Payment>[]>(() => [
        {
            key: 'date',
            header: 'Date',
            className: 'text-slate-500 dark:text-slate-400 text-xs font-semibold whitespace-nowrap',
            cell: (payment) => new Date(payment.createdAt).toLocaleDateString(),
        },
        {
            key: 'transactionId',
            header: 'Transaction ID',
            className: 'text-slate-700 dark:text-slate-300 font-mono text-xs font-bold',
            cell: (payment) => payment.transactionId,
        },
        {
            key: 'customer',
            header: 'Customer',
            className: 'text-slate-900 dark:text-white font-bold text-xs',
            cell: (payment) => payment.order?.customerName || 'Unknown',
        },
        {
            key: 'amount',
            header: 'Amount',
            className: 'text-indigo-600 dark:text-indigo-400 font-black font-mono text-xs',
            cell: (payment) => formatPrice(payment.amount || 0),
        },
        {
            key: 'method',
            header: 'Method',
            className: 'text-slate-600 dark:text-slate-300 capitalize text-xs font-semibold',
            cell: (payment) => payment.method,
        },
        {
            key: 'status',
            header: 'Status',
            cell: (payment) => {
                const isSuccess = payment.status === 'completed' || payment.status === 'SUCCESS';
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isSuccess
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                    }`}>
                        {payment.status}
                    </span>
                );
            },
        },
    ], [formatPrice]);

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                        Payments <span className="text-indigo-600">History</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                        Real-time Transaction Records, Customer Invoices & Ledger Status
                    </p>
                </div>
                
                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Volume card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-all duration-300">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl">
                        <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Page Volume</span>
                        <span className="text-xl font-mono font-black text-slate-900 dark:text-white block mt-1">
                            {formatPrice(stats.pageVolume)}
                        </span>
                    </div>
                </div>

                {/* Success Rate card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-all duration-300">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl">
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Page Success Rate</span>
                        <span className="text-xl font-mono font-black text-slate-900 dark:text-white block mt-1">
                            {stats.successRate}%
                        </span>
                    </div>
                </div>

                {/* Total Count card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-all duration-300">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl">
                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Records</span>
                        <span className="text-xl font-mono font-black text-slate-900 dark:text-white block mt-1">
                            {pagination.total} Transactions
                        </span>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={payments}
                columns={columns}
                getRowKey={(payment) => payment.id}
                loading={loading}
                loadingLabel="Syncing payment logs..."
                emptyLabel="No transactions found matching your criteria."
                containerClassName="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                minWidthClassName="min-w-[1000px]"
                pagination={{
                    page: pagination.page,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange: onPageChange,
                }}
                paginationSummary={
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center sm:text-left">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>
                }
            />
        </div>
    );
}
