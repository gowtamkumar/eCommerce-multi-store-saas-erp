'use client';
import { useSettings } from '@/hooks/SettingsContext';
import {
    ArrowDownLeft,
    ArrowLeft,
    ArrowUpRight,
    FileText,
    History,
    Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

export default function SupplierAPLedger({ supplier, ledgerEntries = [], loading = false, pagination = { page: 1, totalPages: 1 }, onPageChange }: any) {
    const { formatPrice } = useSettings();

    const outstandingBalance = ledgerEntries[0]?.balanceAfter || 0;

    const columns = useMemo<DataTableColumn<any>[]>(() => [
        {
            key: 'date',
            header: 'Date',
            className: 'text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono',
            cell: (entry) => new Date(entry.createdAt).toLocaleDateString(),
        },
        {
            key: 'reference',
            header: 'Reference',
            cell: (entry) => {
                const isCredit = Number(entry.credit) > 0;
                return (
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isCredit ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>
                            {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                            <span className="text-slate-900 dark:text-white font-bold block tracking-tight uppercase text-xs">{entry.referenceType}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-tight">{entry.remarks || 'Standard Transaction'}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'payable',
            header: 'Payable (+)',
            headerClassName: 'text-right text-rose-500',
            className: 'text-right font-mono font-bold text-rose-600 dark:text-rose-400',
            cell: (entry) => Number(entry.credit) > 0 ? `+ ${formatPrice(entry.credit)}` : '-',
        },
        {
            key: 'payment',
            header: 'Payment (-)',
            headerClassName: 'text-right text-emerald-500',
            className: 'text-right font-mono font-bold text-emerald-600 dark:text-emerald-400',
            cell: (entry) => Number(entry.debit) > 0 ? `- ${formatPrice(entry.debit)}` : '-',
        },
        {
            key: 'balance',
            header: 'Net Balance',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (entry) => (
                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl font-mono font-black text-slate-900 dark:text-white text-sm shadow-inner">
                    {formatPrice(entry.balanceAfter)}
                </span>
            ),
        },
    ], [formatPrice]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/procurement/suppliers`}
                        className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Payables Ledger</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-2">
                            <History className="w-4 h-4 text-brand-500" />
                            Transaction history for <span className="text-slate-900 dark:text-white">{supplier?.name}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl flex items-center gap-6 pr-8">
                    <div className="p-4 bg-brand-600 rounded-[1.5rem] shadow-lg shadow-brand-500/30">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Outstanding Balance</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {formatPrice(outstandingBalance)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Audit Trail
                    </h3>
                </div>
                <DataTable
                    data={ledgerEntries}
                    columns={columns}
                    getRowKey={(entry) => entry.id}
                    loading={loading && ledgerEntries.length === 0}
                    loadingLabel="Loading ledger entries..."
                    emptyLabel={
                        <div className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            No transactions recorded yet
                        </div>
                    }
                    containerClassName="shadow-none border-none rounded-none"
                    minWidthClassName="min-w-[700px]"
                    pagination={pagination && pagination.totalPages > 1 ? {
                        page: pagination.page,
                        total: pagination.totalPages * 20, // approximated
                        totalPages: pagination.totalPages,
                        onPageChange,
                    } : undefined}
                />
            </div>
        </div>
    );
}
