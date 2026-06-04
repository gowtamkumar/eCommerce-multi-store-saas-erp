'use client';

import { useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import type { GLJournalEntry, GlTableRow } from '../../types';
import { buildGlColumns } from './glColumns';

export interface FinancialJournalsViewProps {
    entries: GLJournalEntry[];
    expandedJournals: string[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    onToggleExpand: (id: string) => void;
    onReverse: (id: string) => void;
}

export default function FinancialJournalsView({
    entries,
    expandedJournals,
    loading,
    search,
    onSearchChange,
    onToggleExpand,
    onReverse,
}: FinancialJournalsViewProps) {
    const { formatPrice } = useSettings();

    const tableData = useMemo<GlTableRow[]>(() => {
        const result: GlTableRow[] = [];
        entries.forEach((journal) => {
            const isExpanded = expandedJournals.includes(journal.id);
            result.push({ ...journal, isParent: true, isExpanded });
            if (isExpanded) {
                journal.lines?.forEach((line) => {
                    result.push({ ...line, isLine: true, parentId: journal.id });
                });
            }
        });
        return result;
    }, [entries, expandedJournals]);

    const columns = useMemo(() => buildGlColumns(formatPrice, onReverse), [formatPrice, onReverse]);

    const getRowClassName = useCallback((row: GlTableRow) => {
        if (row.isLine) {
            return 'bg-slate-50/40 dark:bg-slate-900/10 border-l-4 border-indigo-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/30';
        }
        return 'font-semibold cursor-pointer';
    }, []);

    const handleRowClick = useCallback((row: GlTableRow) => {
        if (row.isLine) return;
        onToggleExpand(row.id);
    }, [onToggleExpand]);

    return (
        <>
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search description, reference, or accounts..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                />
            </div>

            <DataTable
                data={tableData}
                columns={columns}
                getRowKey={(row) => row.id}
                loading={loading}
                loadingLabel="Loading journal entries..."
                emptyLabel="No financial journal transactions found."
                rowClassName={getRowClassName}
                onRowClick={handleRowClick}
                minWidthClassName="min-w-[1000px]"
                containerClassName="rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            />
        </>
    );
}
