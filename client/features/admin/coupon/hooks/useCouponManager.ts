'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import type { Coupon, CouponPagination } from '../types';

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function useCouponManager() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [pagination, setPagination] = useState<CouponPagination>({
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 0,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const loadCoupons = useCallback(async (page: number, search: string, status: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: PAGE_SIZE.toString(),
                ...(search && { search }),
                ...(status && { isActive: status }),
            });
            const res = await fetchAPI(`/coupons?${params}`);
            if (res.success && res.data) {
                const total = res.data.total ?? 0;
                setCoupons(res.data.coupons || []);
                setPagination({
                    page: res.data.page || page,
                    limit: PAGE_SIZE,
                    total,
                    totalPages: Math.ceil(total / PAGE_SIZE),
                });
            }
        } catch (error) {
            console.error('Failed to load coupons', error);
            toast.error(getErrorMessage(error, 'Failed to load coupons'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCoupons(1, debouncedSearch, statusFilter);
    }, [debouncedSearch, statusFilter, loadCoupons]);

    const refresh = useCallback(() => {
        void loadCoupons(pagination.page, debouncedSearch, statusFilter);
    }, [loadCoupons, pagination.page, debouncedSearch, statusFilter]);

    const deleteCoupon = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        const toastId = toast.loading('Deleting coupon...');
        try {
            const res = await fetchAPI(`/coupons/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Coupon deleted', { id: toastId });
                refresh();
            } else {
                toast.error(res.message || 'Failed to delete coupon', { id: toastId });
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete coupon'), { id: toastId });
        }
    }, [refresh]);

    const openEdit = useCallback((coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsFormOpen(true);
    }, []);

    const openCreate = useCallback(() => {
        setSelectedCoupon(null);
        setIsFormOpen(true);
    }, []);

    const closeForm = useCallback(() => setIsFormOpen(false), []);

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        refresh();
    }, [refresh]);

    const changePage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void loadCoupons(newPage, debouncedSearch, statusFilter);
        }
    }, [pagination.totalPages, debouncedSearch, statusFilter, loadCoupons]);

    const isSearchLoading = useMemo(
        () => debouncedSearch !== searchQuery,
        [debouncedSearch, searchQuery],
    );

    return {
        coupons,
        loading,
        searchQuery,
        statusFilter,
        pagination,
        isFormOpen,
        selectedCoupon,
        isSearchLoading,
        setSearchQuery,
        setStatusFilter,
        deleteCoupon,
        openEdit,
        openCreate,
        closeForm,
        handleFormSuccess,
        changePage,
    };
}
