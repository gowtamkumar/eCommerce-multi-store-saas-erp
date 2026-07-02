'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { AuditLog, PaginationMeta } from '../types';

export function useAuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 15, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [actorSearch, setActorSearch] = useState('');
    const [storeIdFilter, setStoreIdFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const debouncedActorSearch = useDebounce(actorSearch, 500);
    const debouncedStoreIdFilter = useDebounce(storeIdFilter, 500);

    const fetchLogs = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const { fetchAPI } = await import('@/services/api');
            
            // Build query params
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '15');
            if (actionFilter) params.append('action', actionFilter);
            if (entityFilter) params.append('entity', entityFilter);
            if (debouncedActorSearch) params.append('userId', debouncedActorSearch); // backend filters by userId
            if (debouncedStoreIdFilter) params.append('storeId', debouncedStoreIdFilter);
            if (fromDate) params.append('from', new Date(fromDate).toISOString());
            if (toDate) params.append('to', new Date(toDate).toISOString());

            const res = await fetchAPI(`/audit-logs?${params.toString()}`);
            if (res?.data) {
                setLogs(res.data.data || []);
                setMeta(res.data.meta || { total: 0, page: 1, limit: 15, totalPages: 1 });
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    }, [actionFilter, entityFilter, debouncedActorSearch, debouncedStoreIdFilter, fromDate, toDate]);

    // Separate page change handler
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        void fetchLogs(page);
    }, [fetchLogs]);

    // Trigger when filters or debounced values change
    useEffect(() => {
        setCurrentPage(1);
        void fetchLogs(1);
    }, [actionFilter, entityFilter, debouncedActorSearch, debouncedStoreIdFilter, fromDate, toDate, fetchLogs]);

    const handleResetFilters = useCallback(() => {
        setActionFilter('');
        setEntityFilter('');
        setActorSearch('');
        setStoreIdFilter('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
    }, []);

    const handleRefresh = useCallback(() => {
        void fetchLogs(currentPage);
    }, [fetchLogs, currentPage]);

    return {
        logs,
        meta,
        loading,
        selectedLog,
        setSelectedLog,
        actionFilter,
        setActionFilter,
        entityFilter,
        setEntityFilter,
        actorSearch,
        setActorSearch,
        storeIdFilter,
        setStoreIdFilter,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        currentPage,
        setCurrentPage,
        debouncedActorSearch,
        debouncedStoreIdFilter,
        handlePageChange,
        handleResetFilters,
        handleRefresh,
    };
}
