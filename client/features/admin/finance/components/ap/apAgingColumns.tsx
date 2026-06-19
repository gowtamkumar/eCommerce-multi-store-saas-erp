'use client';

import { UserCheck } from 'lucide-react';
import type { DataTableColumn } from '@/components/shared/DataTable';
import type { ApAgingRow } from '../../types';
import { getApOverdueAmount } from '../../lib/buildApPaymentReminderContext';
import ApAgingBadge from './ApAgingBadge';

type PriceFormatter = (amount: number) => string;

export function buildApAgingColumns(
    formatPrice: PriceFormatter,
    onRemind: (row: ApAgingRow) => void,
): DataTableColumn<ApAgingRow>[] {
    return [
        {
            key: 'supplierName',
            header: 'Supplier Name',
            cell: (row) => (
                <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{row.supplierName}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{row.email || row.phone || 'No contact'}</p>
                </div>
            ),
        },
        {
            key: 'totalOutstanding',
            header: 'Outstanding',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => (
                <span className="font-black text-slate-900 dark:text-white text-sm font-mono">
                    {formatPrice(row.totalOutstanding)}
                </span>
            ),
        },
        {
            key: 'current',
            header: 'Not Yet Due',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <ApAgingBadge days="Current" amount={row.aging.current} />,
        },
        {
            key: '1-30',
            header: '1-30 Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <ApAgingBadge days="1-30" amount={row.aging['1-30']} />,
        },
        {
            key: '31-60',
            header: '31-60 Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <ApAgingBadge days="31-60" amount={row.aging['31-60']} />,
        },
        {
            key: '61-90',
            header: '61-90 Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <ApAgingBadge days="61-90" amount={row.aging['61-90']} />,
        },
        {
            key: '90+',
            header: '90+ Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <ApAgingBadge days="90+" amount={row.aging['90+']} />,
        },
        {
            key: 'action',
            header: 'Action',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) =>
                getApOverdueAmount(row) > 0 ? (
                    <button
                        type="button"
                        onClick={() => onRemind(row)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm inline-flex ml-auto"
                        title="Draft internal approver reminder"
                    >
                        <UserCheck className="w-3.5 h-3.5" />
                        Remind
                    </button>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                ),
        },
    ];
}
