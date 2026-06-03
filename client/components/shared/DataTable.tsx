'use client';

import Pagination from '@/components/shared/Pagination';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

export type DataTableColumn<T> = {
    key: string;
    header: ReactNode;
    cell: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
};

export type DataTablePagination = {
    page: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
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
}: DataTableProps<T>) {
    const colSpan = Math.max(columns.length, 1);

    const getResolvedRowClassName = (row: T) => {
        const customClassName = typeof rowClassName === 'function' ? rowClassName(row) : rowClassName;
        return [
            'group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors',
            customClassName,
        ]
            .filter(Boolean)
            .join(' ');
    };

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden ${containerClassName}`}>
            <div className={`overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500 scrollbar-track-transparent ${tableWrapperClassName}`}>
                <table className={`w-full text-left ${minWidthClassName}`}>
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 ${column.headerClassName || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
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
                            data.map((row) => (
                                <tr
                                    key={getRowKey(row)}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    className={`${getResolvedRowClassName(row)} ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className={`px-6 py-4 ${column.className || ''}`}>
                                            {column.cell(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
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
