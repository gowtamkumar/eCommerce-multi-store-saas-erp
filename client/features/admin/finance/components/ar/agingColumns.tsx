'use client';

import { AlertTriangle, DollarSign } from 'lucide-react';
import type { DataTableColumn } from '@/components/shared/DataTable';
import type { ArAgingRow } from '@/features/admin/customer/type';
import AgingBadge from './AgingBadge';

export function buildAgingColumns(onPay: (row: ArAgingRow) => void): DataTableColumn<ArAgingRow>[] {
    return [
        {
            key: 'customer',
            header: 'Customer / Company',
            cell: (row) => (
                <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{row.customerName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.companyName || row.customerEmail}</p>
                    {row.creditHold && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                            <AlertTriangle className="w-2.5 h-2.5" /> Credit Hold
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'outstanding',
            header: 'Outstanding',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => {
                const utilization = row.creditLimit > 0 ? (row.totalOutstanding / row.creditLimit) * 100 : 0;
                return (
                    <div>
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
                    </div>
                );
            },
        },
        {
            key: 'current',
            header: 'Current',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="Current" amount={row.aging.current} />,
        },
        {
            key: '1-30',
            header: '1-30 Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="1-30" amount={row.aging['1-30']} />,
        },
        {
            key: '31-60',
            header: '31-60 Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="31-60" amount={row.aging['31-60']} />,
        },
        {
            key: '61-90',
            header: '61-90 Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="61-90" amount={row.aging['61-90']} />,
        },
        {
            key: '90+',
            header: '90+ Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="90+" amount={row.aging['90+']} />,
        },
        {
            key: 'creditLimit',
            header: 'Credit Limit',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => row.creditLimit > 0
                ? <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">${Number(row.creditLimit).toLocaleString()}</span>
                : <span className="text-slate-400 text-sm">-</span>,
        },
        {
            key: 'action',
            header: 'Action',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => (
                <button
                    onClick={() => onPay(row)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm ml-auto inline-flex"
                >
                    <DollarSign className="w-3.5 h-3.5" />
                    Pay
                </button>
            ),
        },
    ];
}
