'use client';

import { useMemo } from 'react';
import { FileText, Search } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import type { ArAgingRow } from '@/features/admin/customer/type';
import ArSummaryCards from './ArSummaryCards';
import { buildAgingColumns } from './agingColumns';

export interface ArAgingDashboardProps {
    rows: ArAgingRow[];
    filtered: ArAgingRow[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    totalOutstanding: number;
    totalOverdue: number;
    holdCount: number;
    onPay: (row: ArAgingRow) => void;
}

export default function ArAgingDashboard({
    rows,
    filtered,
    loading,
    search,
    onSearchChange,
    totalOutstanding,
    totalOverdue,
    holdCount,
    onPay,
}: ArAgingDashboardProps) {
    const columns = useMemo(() => buildAgingColumns(onPay), [onPay]);

    return (
        <>
            <ArSummaryCards
                totalOutstanding={totalOutstanding}
                totalOverdue={totalOverdue}
                holdCount={holdCount}
                accountCount={rows.length}
            />

            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search customer, company, email..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                />
            </div>

            <DataTable
                data={filtered}
                columns={columns}
                getRowKey={(row) => row.customerId}
                loading={loading}
                loadingLabel="Loading aging report..."
                emptyLabel={
                    <div className="flex flex-col items-center gap-3 text-slate-400 py-4">
                        <FileText className="w-10 h-10 opacity-40" />
                        <p className="text-sm font-medium">No outstanding AR balances found</p>
                        <p className="text-xs">All B2B accounts are fully settled</p>
                    </div>
                }
                minWidthClassName="min-w-[1100px]"
                containerClassName="rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            />
        </>
    );
}
