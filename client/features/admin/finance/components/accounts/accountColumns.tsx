'use client';

import { Edit2, Trash2 } from 'lucide-react';
import type { DataTableColumn } from '@/components/shared/DataTable';
import type { ChartAccount } from '../../types';

export function buildAccountColumns(
    formatPrice: (amount: number) => string,
    onEdit: (account: ChartAccount) => void,
    onDelete: (id: string) => void,
): DataTableColumn<ChartAccount>[] {
    return [
        {
            key: 'code',
            header: 'Account Code',
            cell: (account) => (
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    {account.code}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Account Name',
            cell: (account) => (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {account.name}
                </span>
            ),
        },
        {
            key: 'type',
            header: 'Classification',
            cell: (account) => (
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    account.type === 'ASSET'
                        ? 'bg-emerald-100 text-emerald-600'
                        : account.type === 'LIABILITY'
                            ? 'bg-rose-100 text-rose-600'
                            : account.type === 'REVENUE'
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-slate-100 text-slate-600'
                }`}>
                    {account.type}
                </span>
            ),
        },
        {
            key: 'category',
            header: 'Category',
            cell: (account) => (
                <span className="text-xs text-slate-500 font-semibold">
                    {account.category}
                </span>
            ),
        },
        {
            key: 'balance',
            header: 'Current Balance',
            cell: (account) => (
                <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                    {formatPrice(Number(account.balance))}
                </span>
            ),
        },
        {
            key: 'isSystem',
            header: 'Type',
            cell: (account) => account.isSystem ? (
                <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    System Locked
                </span>
            ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                    Custom
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (account) => !account.isSystem ? (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => onEdit(account)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors inline-block"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    {Number(account.balance) === 0 && (
                        <button
                            onClick={() => onDelete(account.id)}
                            className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors inline-block"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) : null,
        },
    ];
}
