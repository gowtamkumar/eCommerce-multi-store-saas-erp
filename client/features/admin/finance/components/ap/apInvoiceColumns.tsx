'use client';

import { CheckSquare, Square } from 'lucide-react';
import type { DataTableColumn } from '@/components/shared/DataTable';
import type { UnpaidInvoice } from '../../types';

type PriceFormatter = (amount: number) => string;

export function buildApInvoiceColumns(
    selectedInvoiceIds: string[],
    formatPrice: PriceFormatter,
): DataTableColumn<UnpaidInvoice>[] {
    return [
        {
            key: 'select',
            header: '',
            className: 'w-12 text-center',
            cell: (inv) => {
                const isSelected = selectedInvoiceIds.includes(inv.id);
                return (
                    <button type="button" className="text-slate-400 hover:text-brand-600 inline-block">
                        {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-brand-600" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                    </button>
                );
            },
        },
        {
            key: 'invoiceNumber',
            header: 'Invoice Ref',
            cell: (inv) => (
                <div>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                        {inv.invoiceNumber}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-medium mt-0.5">
                        Bill Date: {new Date(inv.invoiceDate).toLocaleDateString()}
                    </span>
                </div>
            ),
        },
        {
            key: 'supplier',
            header: 'Supplier',
            cell: (inv) => (
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    {inv.supplier?.name}
                </span>
            ),
        },
        {
            key: 'dueDate',
            header: 'Due Date',
            cell: (inv) => (
                <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">
                    {new Date(inv.dueDate).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'outstanding',
            header: 'Outstanding',
            headerClassName: 'text-right',
            className: 'text-right font-mono font-black text-slate-900 dark:text-white text-sm',
            cell: (inv) => formatPrice(Number(inv.totalAmount) - Number(inv.paidAmount || 0)),
        },
        {
            key: 'matchStatus',
            header: 'Match Status',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (inv) => {
                const isMatched = inv.matchStatus === 'MATCHED';
                return (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isMatched ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'}`}>
                        {inv.matchStatus}
                    </span>
                );
            },
        },
    ];
}
