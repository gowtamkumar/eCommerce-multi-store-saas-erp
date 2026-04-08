'use client';

import { fetchAPI } from '@/services/api';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import CouponForm from './CouponForm';
import CouponList from './CouponList';
import type { Coupon, PaginationMeta } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export default function Coupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1, limit: 10, total: 0, totalPages: 0,
    });

    // 500ms debounce — prevents a new API call on every keystroke
    const debouncedSearch = useDebounce(searchTerm, 500);

    const loadCoupons = useCallback(async (page: number, search: string, isActive: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(isActive && { isActive }),
            });
            const res = await fetchAPI(`/coupons?${params}`);
            if (res.success && res.data) {
                setCoupons(res.data.coupons || []);
                setPagination({
                    page,
                    limit: 10,
                    total: res.data.total ?? 0,
                    totalPages: Math.ceil((res.data.total ?? 0) / 10),
                });
            }
        } catch (error) {
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
        try {
            const res = await fetchAPI(`/coupons/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Coupon deleted');
                loadCoupons(pagination.page, debouncedSearch, statusFilter);
            } else {
                toast.error(res.message || 'Failed to delete coupon');
            }
        } catch {
            toast.error('Failed to delete coupon');
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

    return (
        <>
            <CouponList
                coupons={coupons}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                pagination={pagination}
                onPageChange={handlePageChange}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
            />

            <CouponForm
                isOpen={isFormOpen}
                initialData={selectedCoupon}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    loadCoupons(pagination.page, debouncedSearch, statusFilter);
                }}
            />
        </>
    );
}
