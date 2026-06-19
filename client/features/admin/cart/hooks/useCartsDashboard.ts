'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { CartSummary } from '../types';

export function useCartsDashboard() {
    const { data: session } = useSession();
    const [carts, setCarts] = useState<CartSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [abandonedOnly, setAbandonedOnly] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const fetchCarts = useCallback(async (page: number, search: string, abandoned: boolean) => {
        if (!session?.user?.accessToken) return;
        setLoading(true);
        try {
            const abandonedParam = abandoned ? '&abandonedOnly=true' : '';
            const res = await fetchAPI(
                `/carts?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}${abandonedParam}`,
            );

            if (res.success) {
                setCarts(res.data.carts);
                setPagination(res.data.pagination);
            } else {
                toast.error(res.message || 'Failed to fetch carts');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An error occurred while fetching carts');
        } finally {
            setLoading(false);
        }
    }, [session, pagination.limit]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void fetchCarts(1, debouncedSearch, abandonedOnly);
        }, 0);
        return () => window.clearTimeout(timeout);
    }, [debouncedSearch, abandonedOnly, fetchCarts]);

    const handlePageChange = useCallback((newPage: number) => {
        void fetchCarts(newPage, debouncedSearch, abandonedOnly);
    }, [debouncedSearch, abandonedOnly, fetchCarts]);

    return {
        carts,
        loading,
        searchQuery,
        setSearchQuery,
        abandonedOnly,
        setAbandonedOnly,
        pagination,
        handlePageChange,
    };
}
