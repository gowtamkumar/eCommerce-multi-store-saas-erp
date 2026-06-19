'use client';

import { useMemo } from 'react';
import { FileText, Search } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import type { ApAgingRow } from '../../types';
import ApSummaryCards from './ApSummaryCards';
import { buildApAgingColumns } from './apAgingColumns';

export interface ApAgingDashboardProps {
    agingData: ApAgingRow[];
    filteredAging: ApAgingRow[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    totalOutstanding: number;
    totalOverdue: number;
    onRemind: (row: ApAgingRow) => void;
}

export default function ApAgingDashboard({
    agingData,
    filteredAging,
    loading,
    search,
    onSearchChange,
    totalOutstanding,
    totalOverdue,
    onRemind,
}: ApAgingDashboardProps) {
    const { formatPrice } = useSettings();
    const columns = useMemo(() => buildApAgingColumns(formatPrice, onRemind), [formatPrice, onRemind]);

    return (
        <>
            <ApSummaryCards
                totalOutstanding={totalOutstanding}
                totalOverdue={totalOverdue}
                supplierCount={agingData.length}
            />

            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search supplier..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                />
            </div>

            <DataTable
                data={filteredAging}
                columns={columns}
                getRowKey={(row) => row.supplierId}
                loading={loading}
                loadingLabel="Loading aging ledger..."
                emptyLabel={
                    <div className="flex flex-col items-center gap-3 text-slate-400 py-4">
                        <FileText className="w-12 h-12 opacity-30" />
                        <p className="font-black text-sm uppercase tracking-widest text-slate-400">No outstanding AP</p>
                        <p className="text-xs text-slate-500 font-medium">All supplier balances are paid and settled</p>
                    </div>
                }
                minWidthClassName="min-w-[900px]"
                containerClassName="rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            />
        </>
    );
}
