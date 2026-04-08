'use client';

import { fetchAPI } from '@/services/api';
import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import CouponList from './CouponList';
import type { Coupon, CouponPagination } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

// Lazy load the form to optimize bundle size
const CouponForm = dynamic(() => import('./CouponForm'), {
    loading: () => null,
    ssr: false
});

export default function CouponDashboard() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [pagination, setPagination] = useState<CouponPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const loadCoupons = useCallback(async (page: number, search: string, status: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(status && { isActive: status }),
            });
            const res = await fetchAPI(`/coupons?${params}`);
            if (res.success && res.data) {
                setCoupons(res.data.coupons || []);
                setPagination({
                    page: res.data.page || page,
                    limit: 10,
                    total: res.data.total ?? 0,
                    totalPages: Math.ceil((res.data.total ?? 0) / 10),
                });
            }
        } catch (error) {
            console.error('Failed to load coupons', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCoupons(1, debouncedSearch, statusFilter);
    }, [debouncedSearch, statusFilter, loadCoupons]);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        const toastId = toast.loading('Deleting coupon...');
        try {
            const res = await fetchAPI(`/coupons/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Coupon deleted', { id: toastId });
                loadCoupons(pagination.page, debouncedSearch, statusFilter);
            } else {
                toast.error(res.message || 'Failed to delete coupon', { id: toastId });
            }
        } catch (error) {
            toast.error('Failed to delete coupon', { id: toastId });
        }
    }, [pagination.page, debouncedSearch, statusFilter, loadCoupons]);

    const handleEdit = useCallback((coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsFormOpen(true);
    }, []);

    const handleAdd = useCallback(() => {
        setSelectedCoupon(null);
        setIsFormOpen(true);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            loadCoupons(newPage, debouncedSearch, statusFilter);
        }
    }, [pagination.totalPages, debouncedSearch, statusFilter, loadCoupons]);

    const isSearchLoading = useMemo(() => debouncedSearch !== searchQuery, [debouncedSearch, searchQuery]);

    return (
        <>
            <CouponList
                coupons={coupons}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                pagination={pagination}
                onPageChange={handlePageChange}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                isSearchLoading={isSearchLoading}
            />

            {isFormOpen && (
                <CouponForm
                    isOpen={isFormOpen}
                    initialData={selectedCoupon}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        loadCoupons(pagination.page, debouncedSearch, statusFilter);
                    }}
                />
            )}
        </>
    );
}
