'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import type { GrnData, GrnPagination } from '../types';

export function useGrnList() {
    const [grns, setGrns] = useState<GrnData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState<GrnPagination>({
        page: 1,
        totalPages: 1,
        total: 0,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchGrns = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(debouncedSearch && { q: debouncedSearch }),
                ...(statusFilter && { status: statusFilter })
            });
            const response = await fetchAPI(`/operations/logistics/grn?${params.toString()}`);
            if (response.success && response.data?.items && response.data.items.length > 0) {
                setGrns(response.data.items);
                setPagination({
                    page: response.data.page || page,
                    totalPages: response.data.totalPages || 1,
                    total: response.data.total
                });
            } else {
                setGrns([]);
                setPagination({ page: 1, totalPages: 1, total: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch GRNs:', error);
            setGrns([]);
            setPagination({ page: 1, totalPages: 1, total: 0 });
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter]);

    useEffect(() => {
        void fetchGrns(1);
    }, [debouncedSearch, statusFilter, fetchGrns]);

    const handlePageChange = useCallback((page: number) => {
        void fetchGrns(page);
    }, [fetchGrns]);

    return {
        grns,
        loading,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        pagination,
        handlePageChange,
        fetchGrns,
    };
}
