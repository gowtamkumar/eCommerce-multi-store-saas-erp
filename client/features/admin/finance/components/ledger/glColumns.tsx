'use client';

import { ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';
import type { DataTableColumn } from '@/components/shared/DataTable';
import type { GlTableRow } from '../../types';

type PriceFormatter = (amount: number) => string;

export function buildGlColumns(
    formatPrice: PriceFormatter,
    onReverse: (id: string) => void,
): DataTableColumn<GlTableRow>[] {
    return [
        {
            key: 'chevron',
            header: '',
            className: 'w-12 text-center',
            cell: (row) => {
                if (row.isLine) return null;
                return row.isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 mx-auto" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 mx-auto" />
                );
            },
        },
        {
            key: 'date',
            header: 'Date',
            cell: (row) => {
                if (row.isLine) {
                    return <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{row.account?.code}</span>;
                }
                return (
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {new Date(row.date || row.createdAt || '').toLocaleDateString()}
                    </span>
                );
            },
        },
        {
            key: 'type',
            header: 'Journal Type',
            cell: (row) => {
                if (row.isLine) {
                    return <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.account?.name}</span>;
                }
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                        {row.type}
                    </span>
                );
            },
        },
        {
            key: 'description',
            header: 'Description',
            cell: (row) => {
                if (row.isLine) {
                    return row.side === 'DEBIT' ? (
                        <span className="font-mono text-emerald-600 font-bold text-xs">{formatPrice(row.amount || 0)}</span>
                    ) : null;
                }
                return (
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {row.description}
                        {row.isReversal && (
                            <span className="ml-2 px-2 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-900/20 rounded text-[9px] font-bold">REVERSAL</span>
                        )}
                    </span>
                );
            },
        },
        {
            key: 'reference',
            header: 'Reference',
            cell: (row) => {
                if (row.isLine) {
                    return row.side === 'CREDIT' ? (
                        <span className="font-mono text-indigo-600 font-bold text-xs">{formatPrice(row.amount || 0)}</span>
                    ) : null;
                }
                return (
                    <span className="text-xs text-slate-400 font-mono">
                        {row.referenceType ? `${row.referenceType}: ${row.referenceId}` : '-'}
                    </span>
                );
            },
        },
        {
            key: 'total',
            header: 'Debit/Credit Total',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => {
                if (row.isLine) {
                    return (
                        <span className="font-mono text-slate-400 dark:text-slate-400 text-xs">
                            {formatPrice(row.balanceAfter || 0)}
                        </span>
                    );
                }
                return (
                    <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
                        {formatPrice(row.totalAmount || 0)}
                    </span>
                );
            },
        },
        {
            key: 'status',
            header: 'Status',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => {
                if (row.isLine) return null;
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${row.isReversal ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        POSTED
                    </span>
                );
            },
        },
        {
            key: 'actions',
            header: '',
            className: 'w-16 text-right',
            cell: (row) => {
                if (row.isLine) return null;
                if (!row.isReversal && !row.reversedJournalEntryId) {
                    return (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onReverse(row.id);
                            }}
                            title="Post reversing entry to void transaction"
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors inline-block"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                    );
                }
                return null;
            },
        },
    ];
}
