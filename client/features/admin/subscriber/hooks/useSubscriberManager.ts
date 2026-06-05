'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Pagination } from '../../customer/type';
import { buildSubscribersCsv, downloadCsv } from '../lib/subscriberCsv';
import type { Subscriber } from '../type';

const PAGE_SIZE = 10;
const EXPORT_LIMIT = 5000;

const DEFAULT_PAGINATION: Pagination = {
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
};

interface SubscribersApiResponse {
    data?: Subscriber[];
    pagination?: Pagination;
}

function buildSubscriberParams(page: number, limit: number, search: string) {
    return new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
    });
}

export function useSubscriberManager() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchSubscribers = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = buildSubscriberParams(page, PAGE_SIZE, search);
            const res = (await fetchAPI(`/subscribers?${params}`)) as SubscribersApiResponse | null;
            if (res) {
                setSubscribers(res.data || []);
                if (res.pagination) setPagination(res.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch subscribers', error);
            toast.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchSubscribers(1, debouncedSearch);
    }, [debouncedSearch, fetchSubscribers]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void fetchSubscribers(newPage, debouncedSearch);
        }
    }, [pagination.totalPages, debouncedSearch, fetchSubscribers]);

    const handleExport = useCallback(async () => {
        setExporting(true);
        const exportToast = toast.loading('Preparing export data...');
        try {
            const params = buildSubscriberParams(1, EXPORT_LIMIT, debouncedSearch);
            const res = (await fetchAPI(`/subscribers?${params}`)) as SubscribersApiResponse | null;
            if (res && res.data) {
                const date = new Date().toISOString().split('T')[0];
                downloadCsv(buildSubscribersCsv(res.data), `subscribers_${date}.csv`);
                toast.success(`Successfully exported ${res.data.length} subscribers`, { id: exportToast });
            } else {
                toast.error('Export failed', { id: exportToast });
            }
        } catch (error) {
            console.error('Export failed', error);
            toast.error('Export failed', { id: exportToast });
        } finally {
            setExporting(false);
        }
    }, [debouncedSearch]);

    return {
        subscribers,
        loading,
        exporting,
        searchQuery,
        pagination,
        setSearchQuery,
        handlePageChange,
        handleExport,
    };
}
