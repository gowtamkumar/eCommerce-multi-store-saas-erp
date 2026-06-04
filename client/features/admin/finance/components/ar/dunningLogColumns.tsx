'use client';

import type { DataTableColumn } from '@/components/shared/DataTable';
import type { DunningLog } from '../../types';

const actionColors: Record<DunningLog['actionTaken'], string> = {
    EMAIL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    CREDIT_HOLD: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
    EMAIL_AND_HOLD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
};

export function buildDunningLogColumns(onViewDetails: (log: DunningLog) => void): DataTableColumn<DunningLog>[] {
    return [
        {
            key: 'triggeredDate',
            header: 'Triggered Date',
            cell: (log) => (
                <span className="text-slate-500 font-mono text-xs">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                </span>
            ),
        },
        {
            key: 'customer',
            header: 'Customer',
            cell: (log) => (
                <span className="font-semibold text-slate-900 dark:text-white">
                    {log.customer?.name || 'N/A'}
                    {log.customer?.companyName && <span className="block text-xs font-normal text-slate-400">{log.customer.companyName}</span>}
                </span>
            ),
        },
        {
            key: 'ruleLevel',
            header: 'Rule Level',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (log) => (
                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold">
                    Level {log.dunningRule?.dunningLevel || 'N/A'}
                </span>
            ),
        },
        {
            key: 'actionTaken',
            header: 'Action Taken',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (log) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${actionColors[log.actionTaken] || ''}`}>
                    {log.actionTaken}
                </span>
            ),
        },
        {
            key: 'recipientEmail',
            header: 'Recipient Email',
            cell: (log) => (
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {log.recipientEmail}
                </span>
            ),
        },
        {
            key: 'daysOverdue',
            header: 'Days Overdue',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (log) => (
                <span className="font-black font-mono text-slate-700 dark:text-slate-300">
                    {log.triggeredDaysOverdue} days
                </span>
            ),
        },
        {
            key: 'amountOverdue',
            header: 'Amount Overdue',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (log) => (
                <span className="font-black font-mono text-indigo-600 dark:text-indigo-400">
                    ${Number(log.triggeredAmountOverdue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            key: 'viewEmail',
            header: 'View Email',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (log) => log.emailSubject ? (
                <button
                    onClick={() => onViewDetails(log)}
                    className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all inline-block"
                >
                    Details
                </button>
            ) : (
                <span className="text-slate-400 text-xs">-</span>
            ),
        },
    ];
}
