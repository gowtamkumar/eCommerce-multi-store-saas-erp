'use client';

import { useMemo } from 'react';
import { BookOpen, Filter, Search } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import type { LedgerEntry } from '../../types';
import { INV_TYPE_LABELS } from './ledgerConstants';
import { buildInventoryColumns } from './inventoryColumns';

export interface InventoryMovementsViewProps {
    entries: LedgerEntry[];
    loading: boolean;
    search: string;
    typeFilter: string;
    page: number;
    total: number;
    totalPages: number;
    onSearchChange: (value: string) => void;
    onTypeFilterChange: (value: string) => void;
    onPageChange: (page: number) => void;
}

export default function InventoryMovementsView({
    entries,
    loading,
    search,
    typeFilter,
    page,
    total,
    totalPages,
    onSearchChange,
    onTypeFilterChange,
    onPageChange,
}: InventoryMovementsViewProps) {
    const { formatPrice } = useSettings();
    const columns = useMemo(() => buildInventoryColumns(formatPrice), [formatPrice]);

    const pagination = useMemo(() => ({
        page,
        total,
        totalPages,
        onPageChange,
    }), [page, total, totalPages, onPageChange]);

    const paginationSummary = useMemo(() => (
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
            {total} movements total
        </p>
    ), [total]);

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by product or reference..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-white"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={typeFilter}
                        onChange={(e) => onTypeFilterChange(e.target.value)}
                        className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none transition-all text-slate-700 dark:text-slate-200"
                    >
                        <option value="">All Types</option>
                        {Object.entries(INV_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </div>
            </div>

            <DataTable
                data={entries}
                columns={columns}
                getRowKey={(entry) => entry.id}
                loading={loading}
                loadingLabel="Loading inventory movements..."
                emptyLabel={
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-bold">No inventory movements found</p>
                    </div>
                }
                pagination={pagination}
                paginationSummary={paginationSummary}
                minWidthClassName="min-w-[1000px]"
                containerClassName="rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
            />
        </>
    );
}
