'use client';

import { Trash2 } from 'lucide-react';
import type { DataTableColumn } from '@/components/shared/DataTable';
import type { TaxFilingLog, TaxRule } from '../../types';

type PriceFormatter = (amount: number) => string;

export function buildTaxFilingColumns(formatPrice: PriceFormatter): DataTableColumn<TaxFilingLog>[] {
    return [
        {
            key: 'date',
            header: 'Date',
            cell: (log) => (
                <span className="text-xs font-bold text-slate-400">
                    {new Date(log.date).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            cell: (log) => (
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${log.type.startsWith('OUTPUT') ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                    {log.type}
                </span>
            ),
        },
        {
            key: 'narration',
            header: 'Narration',
            cell: (log) => (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {log.description}
                </span>
            ),
        },
        {
            key: 'taxableBase',
            header: 'Taxable Base',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (log) => (
                <span className="font-semibold font-mono text-xs text-slate-900 dark:text-white">
                    {formatPrice(log.taxableBase)}
                </span>
            ),
        },
        {
            key: 'taxRate',
            header: 'VAT Rate',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (log) => (
                <span className="font-bold text-xs text-slate-600 dark:text-slate-400">
                    {log.taxRate}%
                </span>
            ),
        },
        {
            key: 'taxAmount',
            header: 'Tax Amount',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (log) => (
                <span className="font-black font-mono text-xs text-indigo-600">
                    {formatPrice(log.taxAmount)}
                </span>
            ),
        },
    ];
}

export function buildTaxRuleColumns(onDelete: (id: string) => void): DataTableColumn<TaxRule>[] {
    return [
        {
            key: 'name',
            header: 'Jurisdiction Name',
            cell: (rule) => (
                <span className="text-xs font-black text-slate-900 dark:text-white">
                    {rule.name}
                </span>
            ),
        },
        {
            key: 'category',
            header: 'Tax Category',
            cell: (rule) => (
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-900 text-slate-500">
                    {rule.category}
                </span>
            ),
        },
        {
            key: 'country',
            header: 'Country',
            cell: (rule) => (
                <span className="text-xs font-black text-slate-500">
                    {rule.country}
                </span>
            ),
        },
        {
            key: 'state',
            header: 'State / Region',
            cell: (rule) => (
                <span className="text-xs font-semibold text-slate-400">
                    {rule.state || 'National Standard'}
                </span>
            ),
        },
        {
            key: 'rate',
            header: 'Tax Rate',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (rule) => (
                <span className="font-black font-mono text-sm text-indigo-600">
                    {rule.rate}%
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (rule) => rule.isSystem ? (
                <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-50 text-indigo-600">Locked System</span>
            ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-slate-100 text-slate-500">Custom</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (rule) => !rule.isSystem ? (
                <button
                    onClick={() => onDelete(rule.id)}
                    className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors inline-block"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            ) : null,
        },
    ];
}
