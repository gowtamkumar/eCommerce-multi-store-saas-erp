'use client';

import DataTable from '@/components/shared/DataTable';
import { useCallback, useMemo } from 'react';
import type { Subscriber, SubscribersTableProps } from '../type';
import { buildSubscriberColumns } from './subscriberColumns';

export default function SubscribersTable({
    subscribers,
    loading,
    searchQuery,
    pagination,
    onPageChange,
}: SubscribersTableProps) {
    const columns = useMemo(() => buildSubscriberColumns(), []);

    const dataTablePagination = useMemo(() => ({
        page: pagination.page || 1,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 1,
        onPageChange,
    }), [pagination, onPageChange]);

    const paginationSummary = useMemo(() => (
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Sector {pagination.page} <span className="mx-1 opacity-30">/</span> {pagination.totalPages}
        </span>
    ), [pagination]);

    const getRowKey = useCallback((subscriber: Subscriber) => subscriber.id, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
            <DataTable
                data={subscribers}
                columns={columns}
                getRowKey={getRowKey}
                loading={loading}
                loadingLabel="Synchronizing records..."
                emptyLabel={searchQuery ? 'Zero identity matches' : 'Neural repository empty'}
                containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                rowClassName="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group"
                pagination={dataTablePagination}
                paginationSummary={paginationSummary}
            />
        </div>
    );
}
