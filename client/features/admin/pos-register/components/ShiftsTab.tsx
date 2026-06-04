'use client';

import React, { useMemo } from 'react';
import { Loader2, Download, Info, AlertCircle } from 'lucide-react';
import DataTable, { DataTableColumn, DataTableSortOrder } from '@/components/shared/DataTable';
import { Shift, ShiftSortKey } from '../types';
import { cashierLabel } from '../utils/posRegisterHelpers';

const SHIFT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface ShiftsTabProps {
    shiftSearchQuery: string;
    setShiftSearchQuery: (query: string) => void;
    shiftStatusFilter: 'ALL' | 'OPEN' | 'CLOSED';
    setShiftStatusFilter: (status: 'ALL' | 'OPEN' | 'CLOSED') => void;
    handleExportShifts: () => void;
    exporting: boolean;
    paginatedShifts: Shift[];
    loadingShifts: boolean;
    sortBy: ShiftSortKey;
    sortOrder: DataTableSortOrder;
    handleShiftSort: (key: string) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (limit: number) => void;
    totalShiftsCount: number;
    totalPages: number;
    onViewDetails: (shift: Shift) => void;
}

export default function ShiftsTab({
    shiftSearchQuery,
    setShiftSearchQuery,
    shiftStatusFilter,
    setShiftStatusFilter,
    handleExportShifts,
    exporting,
    paginatedShifts,
    loadingShifts,
    sortBy,
    sortOrder,
    handleShiftSort,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalShiftsCount,
    totalPages,
    onViewDetails,
}: ShiftsTabProps) {
    const shiftColumns = useMemo<DataTableColumn<Shift>[]>(() => [
        {
            key: 'user',
            header: 'Cashier',
            sortKey: 'cashier',
            className: 'font-bold text-slate-800 dark:text-slate-200',
            cell: (shift) => cashierLabel(shift),
        },
        {
            key: 'register',
            header: 'Terminal',
            sortKey: 'terminal',
            className: 'font-semibold text-slate-600 dark:text-slate-300',
            cell: (shift) => shift.register?.name || 'N/A',
        },
        {
            key: 'openingTime',
            header: 'Opened At',
            sortKey: 'openingTime',
            className: 'text-xs text-slate-500 dark:text-slate-400 font-medium',
            cell: (shift) => new Date(shift.openingTime).toLocaleString(),
        },
        {
            key: 'closingTime',
            header: 'Closed At',
            sortKey: 'closingTime',
            className: 'text-xs text-slate-500 dark:text-slate-400 font-medium',
            cell: (shift) => shift.closingTime ? new Date(shift.closingTime).toLocaleString() : '-',
        },
        {
            key: 'expectedClosingBalance',
            header: 'Expected',
            sortKey: 'expected',
            headerClassName: 'text-right',
            className: 'text-right font-semibold text-slate-700 dark:text-slate-355',
            cell: (shift) => `$${Number(shift.expectedClosingBalance).toFixed(2)}`,
        },
        {
            key: 'closingBalance',
            header: 'Audited Actual',
            sortKey: 'actual',
            headerClassName: 'text-right',
            className: 'text-right font-extrabold text-slate-800 dark:text-slate-200',
            cell: (shift) => shift.closingBalance !== null ? `$${Number(shift.closingBalance).toFixed(2)}` : '-',
        },
        {
            key: 'variance',
            header: 'Variance',
            sortKey: 'variance',
            headerClassName: 'text-right',
            className: 'text-right font-black',
            cell: (shift) => {
                const variance = shift.difference !== null ? Number(shift.difference) : 0;
                if (shift.status !== 'CLOSED') {
                    return <span className="text-slate-400 font-bold">-</span>;
                }
                if (variance === 0) {
                    return <span className="text-emerald-600 dark:text-emerald-400">$0.00</span>;
                }
                if (variance > 0) {
                    return <span className="text-emerald-500">+${variance.toFixed(2)}</span>;
                }
                return <span className="text-red-500">-${Math.abs(variance).toFixed(2)}</span>;
            },
        },
        {
            key: 'status',
            header: 'Status',
            sortKey: 'status',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (shift) => (
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                    shift.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-455'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                    {shift.status === 'OPEN' ? 'Open / Active' : 'Audited'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (shift) => (
                <button
                    type="button"
                    onClick={() => onViewDetails(shift)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                    title="View Shift Detail"
                >
                    <Info className="w-4 h-4" />
                    Details
                </button>
            ),
        },
    ], [onViewDetails]);

    const dataTablePagination = useMemo(() => ({
        page: currentPage,
        total: totalShiftsCount,
        totalPages: totalPages,
        onPageChange: (p: number) => setCurrentPage(p),
    }), [currentPage, totalShiftsCount, totalPages, setCurrentPage]);

    const dataTablePaginationSummary = useMemo(() => {
        const start = totalShiftsCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalShiftsCount);
        return (
            <div className="flex items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hidden sm:block">
                    Showing <span className="text-slate-900 dark:text-white px-1">{start}–{end}</span> of <span className="text-slate-900 dark:text-white px-1">{totalShiftsCount}</span>
                </p>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rows</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-2 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer outline-none"
                    >
                        {SHIFT_PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }, [currentPage, itemsPerPage, totalShiftsCount, setCurrentPage, setItemsPerPage]);

    return (
        <div className="space-y-6">
            {/* Filter and Search controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                    <input
                        type="text"
                        value={shiftSearchQuery}
                        onChange={(e) => {
                            setShiftSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search by Cashier, Terminal name..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm outline-none"
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={shiftStatusFilter}
                        onChange={(e) => {
                            setShiftStatusFilter(e.target.value as 'ALL' | 'OPEN' | 'CLOSED');
                            setCurrentPage(1);
                        }}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-bold"
                    >
                        <option value="ALL">All Shift Statuses</option>
                        <option value="OPEN">Active / Open</option>
                        <option value="CLOSED">Audited & Closed</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={handleExportShifts}
                    disabled={exporting || totalShiftsCount === 0}
                    className="w-full md:w-auto px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export CSV
                </button>
            </div>

            <DataTable
                data={paginatedShifts}
                columns={shiftColumns}
                getRowKey={(shift) => shift.id}
                loading={loadingShifts}
                loadingLabel="Scanning shifts registry..."
                emptyLabel="No cashier shift audits recorded."
                containerClassName="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden"
                minWidthClassName="min-w-[1000px]"
                sort={{ sortBy, sortOrder, onSortChange: handleShiftSort }}
                pagination={dataTablePagination}
                paginationSummary={dataTablePaginationSummary}
            />
        </div>
    );
}
