'use client';

import { Lock, Unlock } from 'lucide-react';
import type { DataTableColumn } from '@/components/shared/DataTable';
import type { FiscalPeriod } from '../../types';

export function buildFiscalPeriodColumns(
    onToggleStatus: (id: string, currentStatus: string) => void,
): DataTableColumn<FiscalPeriod>[] {
    return [
        {
            key: 'name',
            header: 'Period Name',
            cell: (period) => (
                <span className="font-bold text-slate-800 dark:text-slate-200">
                    {period.name}
                </span>
            ),
        },
        {
            key: 'startDate',
            header: 'Start Date',
            cell: (period) => (
                <span className="text-xs font-semibold text-slate-500">
                    {new Date(period.startDate).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'endDate',
            header: 'End Date',
            cell: (period) => (
                <span className="text-xs font-semibold text-slate-500">
                    {new Date(period.endDate).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (period) => (
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    period.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-rose-100 text-rose-600'
                }`}>
                    {period.status}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (period) => (
                <button
                    onClick={() => onToggleStatus(period.id, period.status)}
                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest items-center justify-center gap-1.5 border transition-all inline-flex ${
                        period.status === 'OPEN'
                            ? 'border-rose-100 text-rose-600 bg-rose-50/10 hover:bg-rose-600 hover:text-white'
                            : 'border-emerald-100 text-emerald-600 bg-emerald-50/10 hover:bg-emerald-600 hover:text-white'
                    }`}
                >
                    {period.status === 'OPEN' ? (
                        <>
                            <Lock className="w-3.5 h-3.5" /> Lock Period
                        </>
                    ) : (
                        <>
                            <Unlock className="w-3.5 h-3.5" /> Unlock Period
                        </>
                    )}
                </button>
            ),
        },
    ];
}
