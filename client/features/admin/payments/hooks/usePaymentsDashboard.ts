'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import type { Payment, PaymentPagination } from '../types';

export function usePaymentsDashboard() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState<PaymentPagination>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchPayments = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                q: search,
            });
            const res = await fetchAPI(`/payments?${params}`);

            if (res.success && res.data?.items) {
                setPayments(res.data.items);
                setPagination({
                    total: res.data.total,
                    page: res.data.page,
                    limit: res.data.limit,
                    totalPages: res.data.totalPages,
                });
            }
        } catch (error) {
            console.error('Failed to fetch payments', error);
            toast.error('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchPayments(1, debouncedSearch);
    }, [debouncedSearch, fetchPayments]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void fetchPayments(newPage, debouncedSearch);
        }
    }, [debouncedSearch, pagination.totalPages, fetchPayments]);

    return {
        payments,
        loading,
        searchQuery,
        setSearchQuery,
        pagination,
        handlePageChange,
        fetchPayments,
        debouncedSearch
    };
}
