'use client';

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { DataTableColumn } from '@/components/shared/DataTable';
import type { LedgerEntry } from '../../types';
import { INV_TYPE_COLORS, INV_TYPE_LABELS } from './ledgerConstants';

type PriceFormatter = (amount: number) => string;

export function buildInventoryColumns(formatPrice: PriceFormatter): DataTableColumn<LedgerEntry>[] {
    return [
        {
            key: 'date',
            header: 'Date',
            cell: (entry) => (
                <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString()}
                </span>
            ),
        },
        {
            key: 'product',
            header: 'Product',
            cell: (entry) => (
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px] block" title={entry.product?.name}>
                    {entry.product?.name || '-'}
                </span>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            cell: (entry) => {
                const color = INV_TYPE_COLORS[entry.type] || 'slate';
                const isIn = entry.quantity > 0;
                const Icon = isIn ? ArrowUpCircle : ArrowDownCircle;
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-${color}-50 text-${color}-700 dark:bg-${color}-950/20 dark:text-${color}-400`}>
                        <Icon className="w-3 h-3" />
                        {INV_TYPE_LABELS[entry.type] || entry.type}
                    </span>
                );
            },
        },
        {
            key: 'qty',
            header: 'Qty',
            cell: (entry) => {
                const isIn = entry.quantity > 0;
                return (
                    <span className={`text-sm font-black ${isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isIn ? '+' : ''}{entry.quantity}
                    </span>
                );
            },
        },
        {
            key: 'unitCost',
            header: 'Unit Cost',
            cell: (entry) => (
                <span className="text-sm text-slate-600 dark:text-slate-300">
                    {entry.unitCost ? formatPrice(entry.unitCost) : '-'}
                </span>
            ),
        },
        {
            key: 'cogs',
            header: 'COGS',
            cell: (entry) => (
                <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                    {entry.cogsAmount ? formatPrice(entry.cogsAmount) : '-'}
                </span>
            ),
        },
        {
            key: 'balance',
            header: 'Balance',
            cell: (entry) => (
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
                    {entry.balanceAfter}
                </span>
            ),
        },
        {
            key: 'warehouse',
            header: 'Warehouse',
            cell: (entry) => (
                <span className="text-xs text-slate-400 whitespace-nowrap">
                    {entry.warehouse?.name || '-'}
                </span>
            ),
        },
        {
            key: 'reference',
            header: 'Reference',
            cell: (entry) => (
                <span className="text-xs text-slate-400 font-mono truncate max-w-[100px] block" title={entry.referenceId}>
                    {entry.referenceId || '-'}
                </span>
            ),
        },
    ];
}
