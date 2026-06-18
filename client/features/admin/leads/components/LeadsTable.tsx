'use client';

import DataTable from '@/components/shared/DataTable';
import { useCallback, useMemo } from 'react';
import type { LeadMessage, LeadsTableProps } from '../type';
import { buildLeadColumns } from './leadColumns';

export default function LeadsTable({
    leads,
    loading,
    searchQuery,
    pagination,
    updatingStatus,
    onPageChange,
    onStatusUpdate,
    onDraftEmail,
}: LeadsTableProps) {
    const columns = useMemo(() => buildLeadColumns({
        updatingStatus,
        onStatusUpdate,
        onDraftEmail,
    }), [updatingStatus, onStatusUpdate, onDraftEmail]);

    const dataTablePagination = useMemo(() => ({
        page: pagination.page || 1,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 1,
        onPageChange,
    }), [pagination, onPageChange]);

    const paginationSummary = useMemo(() => (
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
            Page {pagination.page || 1} of {pagination.totalPages || 1}
        </span>
    ), [pagination]);

    const getRowKey = useCallback((lead: LeadMessage) => lead.id, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <DataTable
                data={leads}
                columns={columns}
                getRowKey={getRowKey}
                loading={loading}
                loadingLabel="Loading subscribers..."
                emptyLabel={searchQuery ? 'No subscribers match your search.' : 'No subscribers found.'}
                containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                rowClassName="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                pagination={dataTablePagination}
                paginationSummary={paginationSummary}
            />
        </div>
    );
}
