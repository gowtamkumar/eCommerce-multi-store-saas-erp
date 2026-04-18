'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { PurchaseOrderStatus } from '@/lib/enums/purchase-order.type.enum';
import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { PurchaseOrder, PurchaseOrderPagination } from '../types';
import PurchaseOrderList from './PurchaseOrderList';

export default function PurchaseOrderDashboard() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState<PurchaseOrderPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchOrders = useCallback(async (page: number, q: string, status: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(q && { q }),
                ...(status && { status })
            });
            const res = await fetchAPI(`/purchase-orders?${params}`);

            if (res.success && res.data) {
                setOrders(res.data.items || []);
                setPagination({
                    page: res.data.page,
                    limit: res.data.limit,
                    total: res.data.total,
                    totalPages: res.data.totalPages
                });
            }
        } catch (error) {
            console.error('Failed to fetch purchase orders', error);
            toast.error('Failed to load purchase orders');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(1, debouncedSearch, statusFilter);
    }, [debouncedSearch, statusFilter, fetchOrders]);

    const handleReceive = useCallback(async (id: string) => {
        const toastId = toast.loading('Receiving order and updating stock...');
        try {
            await fetchAPI(`/purchase-orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: PurchaseOrderStatus.RECEIVED })
            });
            toast.success('Order received! Inventory updated.', { id: toastId });
            fetchOrders(pagination.page, debouncedSearch, statusFilter);
        } catch (error) {
            toast.error('Failed to receive order', { id: toastId });
        }
    }, [pagination.page, debouncedSearch, statusFilter, fetchOrders]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchOrders(newPage, debouncedSearch, statusFilter);
        }
    }, [pagination.totalPages, debouncedSearch, statusFilter, fetchOrders]);

    return (
        <PurchaseOrderList
            orders={orders}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            pagination={pagination}
            onPageChange={handlePageChange}
            onReceive={handleReceive}
            isSearchLoading={debouncedSearch !== searchQuery}
        />
    );
}
