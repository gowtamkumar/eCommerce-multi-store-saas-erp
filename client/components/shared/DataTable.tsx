'use client';

import Pagination from '@/components/shared/Pagination';
import { ArrowDown, ArrowUp, ChevronsUpDown, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

export type DataTableSortOrder = 'ASC' | 'DESC';

export type DataTableColumn<T> = {
    key: string;
    header: ReactNode;
    cell: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
    /** When set, the column header becomes a sort toggle keyed by this value. */
    sortKey?: string;
};

export type DataTablePagination = {
    page: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export type DataTableSort = {
    sortBy?: string;
    sortOrder: DataTableSortOrder;
    onSortChange: (sortKey: string) => void;
};

export type DataTableSelection<T> = {
    selectedKeys: Set<string>;
    onToggleRow: (key: string, row: T) => void;
    onToggleAll: (rows: T[]) => void;
};

type DataTableProps<T> = {
    data: T[];
    columns: DataTableColumn<T>[];
    getRowKey: (row: T) => string;
    loading?: boolean;
    loadingLabel?: string;
    emptyLabel?: ReactNode;
    minWidthClassName?: string;
    containerClassName?: string;
    rowClassName?: string | ((row: T) => string);
    onRowClick?: (row: T) => void;
    pagination?: DataTablePagination;
    paginationSummary?: ReactNode;
    tableWrapperClassName?: string;
    sort?: DataTableSort;
    selection?: DataTableSelection<T>;
};

export default function DataTable<T>({
    data,
    columns,
    getRowKey,
    loading = false,
    loadingLabel = 'Loading...',
    emptyLabel = 'No records found.',
    minWidthClassName = 'min-w-[900px]',
    containerClassName = '',
    rowClassName,
    onRowClick,
    pagination,
    paginationSummary,
    tableWrapperClassName = '',
    sort,
    selection,
}: DataTableProps<T>) {
    const colSpan = Math.max(columns.length, 1) + (selection ? 1 : 0);

    const allSelected =
        !!selection && data.length > 0 && data.every((row) => selection.selectedKeys.has(getRowKey(row)));
    const someSelected =
        !!selection && !allSelected && data.some((row) => selection.selectedKeys.has(getRowKey(row)));

    const getResolvedRowClassName = (row: T) => {
        const customClassName = typeof rowClassName === 'function' ? rowClassName(row) : rowClassName;
        const isSelected = selection?.selectedKeys.has(getRowKey(row));
        return [
            'group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors',
            isSelected ? 'bg-brand-50/50 dark:bg-brand-900/10' : '',
            customClassName,
        ]
            .filter(Boolean)
            .join(' ');
    };

    const renderSortIndicator = (sortKey: string) => {
        if (!sort) return null;
        if (sort.sortBy !== sortKey) {
            return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />;
        }
        return sort.sortOrder === 'ASC' ? (
            <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
        ) : (
            <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
        );
    };

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden ${containerClassName}`}>
            <div className={`overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500 scrollbar-track-transparent ${tableWrapperClassName}`}>
                <table className={`w-full text-left ${minWidthClassName}`}>
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            {selection && (
                                <th className="px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all rows"
                                        checked={allSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = someSelected;
                                        }}
                                        onChange={() => selection.onToggleAll(data)}
                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                    />
                                </th>
                            )}
                            {columns.map((column) => {
                                const isSortable = !!sort && !!column.sortKey;
                                return (
                                    <th
                                        key={column.key}
                                        className={`px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 ${column.headerClassName || ''}`}
                                    >
                                        {isSortable ? (
                                            <button
                                                type="button"
                                                onClick={() => sort!.onSortChange(column.sortKey!)}
                                                className="inline-flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase tracking-widest"
                                            >
                                                {column.header}
                                                {renderSortIndicator(column.sortKey!)}
                                            </button>
                                        ) : (
                                            column.header
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                                        <span className="font-medium">{loadingLabel}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-500 italic">
                                    {emptyLabel}
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => {
                                const rowKey = getRowKey(row);
                                return (
                                    <tr
                                        key={rowKey}
                                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                                        className={`${getResolvedRowClassName(row)} ${onRowClick ? 'cursor-pointer' : ''}`}
                                    >
                                        {selection && (
                                            <td className="px-6 py-4 w-12" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    aria-label="Select row"
                                                    checked={selection.selectedKeys.has(rowKey)}
                                                    onChange={() => selection.onToggleRow(rowKey, row)}
                                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        {columns.map((column) => (
                                            <td key={column.key} className={`px-6 py-4 ${column.className || ''}`}>
                                                {column.cell(row)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {paginationSummary || (
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                            Page {pagination.page} of {pagination.totalPages}
                        </p>
                    )}
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                        loading={loading}
                    />
                </div>
            )}
        </div>
    );
}
