'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { CourierType } from '@/lib/enums/courier-type.enum';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { handleCreatePathaoOrder, handleCreateSteadfastOrder, handleManualDispatch, updateOrderStatus } from '@/lib/utils';
import type { Order } from '@/types/order';
import type { OrderListPagination, OrderSortOrder } from '../type';

const EXPORT_PAGE_LIMIT = 100;
const EXPORT_MAX_PAGES = 100;

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [creatingOrder, setCreatingOrder] = useState<string | null>(null);
    const [creatingPathaoOrder, setCreatingPathaoOrder] = useState<string | null>(null);
    const [selectedCourier, setSelectedCourier] = useState<{ [orderId: string]: string }>({});
    const [showCourierModal, setShowCourierModal] = useState(false);
    const [pendingCourierOrder, setPendingCourierOrder] = useState<{ order: Order; courier: string } | null>(null);

    // Premium Filter States
    const [statusFilter, setStatusFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');

    // Sorting
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<OrderSortOrder>('DESC');

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkUpdating, setBulkUpdating] = useState(false);

    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState<OrderListPagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    // Guards against out-of-order responses overwriting fresher data.
    const requestIdRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);

    const buildQuery = useCallback((page: number, limit: number) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search: debouncedSearch,
            isAdmin: 'true',
            sortBy,
            sortOrder,
        });
        if (statusFilter) params.append('status', statusFilter);
        if (sourceFilter) params.append('orderSource', sourceFilter);
        if (paymentFilter) params.append('paymentStatus', paymentFilter);
        return params;
    }, [debouncedSearch, sortBy, sortOrder, statusFilter, sourceFilter, paymentFilter]);

    const fetchOrders = useCallback(async (page: number) => {
        const requestId = ++requestIdRef.current;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const params = buildQuery(page, pageSize);
            const res = await fetchAPI(`/orders?${params}`, { signal: controller.signal });

            // Ignore responses that have been superseded by a newer request.
            if (requestId !== requestIdRef.current) return;

            if (res?.data?.orders) {
                setOrders(res.data.orders);
                setPagination(res.data.pagination);
            } else if (res?.success && Array.isArray(res.data)) {
                setOrders(res.data);
                if (res.pagination) {
                    setPagination(res.pagination);
                }
            }
        } catch (error) {
            if ((error as Error)?.name === 'AbortError') return;
            if (requestId !== requestIdRef.current) return;
            console.error('Failed to fetch orders', error);
            toast.error('Failed to load orders');
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [buildQuery, pageSize]);

    // Any change to search / filters / sort / page size resets to page 1.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSelectedIds(new Set());
            void fetchOrders(1);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [fetchOrders]);

    // Abort any in-flight request on unmount.
    useEffect(() => () => abortRef.current?.abort(), []);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setSelectedIds(new Set());
            void fetchOrders(newPage);
        }
    }, [pagination.totalPages, fetchOrders]);

    const handleSortChange = useCallback((sortKey: string) => {
        setSortBy(prevSortBy => {
            if (prevSortBy === sortKey) {
                setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
            } else {
                setSortOrder('DESC');
            }
            return sortKey;
        });
    }, []);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
        setSourceFilter('');
        setPaymentFilter('');
        setSearchQuery('');
    }, []);

    const handleToggleRow = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleToggleAll = useCallback((rows: Order[]) => {
        setSelectedIds((prev) => {
            const allSelected = rows.length > 0 && rows.every((row) => prev.has(row.id));
            const next = new Set(prev);
            if (allSelected) {
                rows.forEach((row) => next.delete(row.id));
            } else {
                rows.forEach((row) => next.add(row.id));
            }
            return next;
        });
    }, []);

    const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);

    const handleBulkStatusChange = useCallback(async (newStatus: string) => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        setBulkUpdating(true);
        const toastId = toast.loading(`Updating ${ids.length} order(s)...`);
        try {
            const results = await Promise.allSettled(
                ids.map((id) => updateOrderStatus(id, { status: newStatus })),
            );
            const succeeded = results.filter(
                (r) => r.status === 'fulfilled' && r.value?.success,
            ).length;
            const failed = ids.length - succeeded;

            if (succeeded > 0) {
                const updated = new Set(ids);
                setOrders((prev) =>
                    prev.map((o) => (updated.has(o.id) ? { ...o, status: newStatus as OrderStatus } : o)),
                );
            }

            if (failed === 0) {
                toast.success(`Updated ${succeeded} order(s)`, { id: toastId });
            } else {
                toast.error(`${succeeded} updated, ${failed} failed`, { id: toastId });
            }
        } finally {
            setBulkUpdating(false);
            handleClearSelection();
        }
    }, [selectedIds, handleClearSelection]);

    const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
        const result = await updateOrderStatus(id, { status: newStatus });

        if (result.success) {
            setOrders(prev => prev.map((o) => o.id === id ? { ...o, status: newStatus as OrderStatus } : o));
            toast.success('Order status updated');
        } else {
            toast.error(result.error || 'Error updating status');
        }
    }, []);

    const handleCreateCourierOrder = useCallback(async (order: Order, courier: string) => {
        try {
            if (courier === CourierType.STEADFAST) {
                await handleCreateSteadfastOrder(order, setCreatingOrder);
            } else if (courier === CourierType.PATHAO) {
                await handleCreatePathaoOrder(order, setCreatingPathaoOrder);
            } else if (courier === CourierType.IN_STORE) {
                const result = await handleManualDispatch(order, setCreatingOrder);
                if (result?.success) {
                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, courierStatus: 'MANUAL', status: OrderStatus.SHIPPED } : o));
                }
            }
            if (courier !== CourierType.IN_STORE) {
                void fetchOrders(pagination.page);
            }
        } catch (error) {
            console.error('Courier order creation failed', error);
        }
    }, [pagination.page, fetchOrders]);

    const isCreatingCourierOrder = useCallback((orderId: string) => {
        return creatingOrder === orderId || creatingPathaoOrder === orderId;
    }, [creatingOrder, creatingPathaoOrder]);

    const handleCourierSelect = useCallback((order: Order, courier: string) => {
        if (courier) {
            setPendingCourierOrder({ order, courier });
            setShowCourierModal(true);
        }
    }, []);

    const handleConfirmCourierOrder = useCallback(async () => {
        if (pendingCourierOrder) {
            const { order, courier } = pendingCourierOrder;
            setShowCourierModal(false);
            setSelectedCourier(prev => ({ ...prev, [order.id]: courier }));
            await handleCreateCourierOrder(order, courier);
            setPendingCourierOrder(null);
        }
    }, [pendingCourierOrder, handleCreateCourierOrder]);

    const handleCancelCourierOrder = useCallback(() => {
        setShowCourierModal(false);
        if (pendingCourierOrder) {
            setSelectedCourier(prev => {
                const newState = { ...prev };
                delete newState[pendingCourierOrder.order.id];
                return newState;
            });
        }
        setPendingCourierOrder(null);
    }, [pendingCourierOrder]);

    const escapeCsv = useCallback((value: string) => value.replace(/"/g, '""'), []);

    const handleExportCSV = useCallback(async () => {
        const toastId = toast.loading('Preparing CSV spreadsheet...');
        try {
            const collected: Order[] = [];
            let page = 1;
            let totalPages = 1;

            do {
                const params = buildQuery(page, EXPORT_PAGE_LIMIT);
                const res = await fetchAPI(`/orders?${params}`);
                const batch: Order[] = res?.data?.orders || (Array.isArray(res?.data) ? res.data : []);
                collected.push(...batch);
                totalPages = res?.data?.pagination?.totalPages || 1;
                page += 1;
            } while (page <= totalPages && page <= EXPORT_MAX_PAGES);

            if (collected.length === 0) {
                toast.error('No orders found with current filters', { id: toastId });
                return;
            }

            let csv = '\ufeffOrder ID,Customer Name,Customer Email,Customer Phone,Sales Channel,Total Amount,Payment Method,Payment Status,Fulfillment Status,Created Date\n';

            collected.forEach((o) => {
                const cleanName = escapeCsv(o.customerName || '');
                const cleanEmail = escapeCsv(o.customerEmail || '');
                const cleanPhone = escapeCsv(o.customerPhone || '');
                const channel = o.orderSource || 'website';
                const total = o.totalAmount || 0;
                const method = o.paymentMethod || 'N/A';
                const payStatus = o.paymentStatus || 'PENDING';
                const fulfillStatus = o.status || 'PENDING';
                const created = new Date(o.createdAt).toLocaleString();

                csv += `"${o.id}","${cleanName}","${cleanEmail}","${cleanPhone}","${channel}",${total},"${method}","${payStatus}","${fulfillStatus}","${created}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Exported ${collected.length} orders!`, { id: toastId });
        } catch (error) {
            console.error('Export failed', error);
            toast.error('Failed to export orders to CSV', { id: toastId });
        }
    }, [buildQuery, escapeCsv]);

    return {
        orders,
        loading,
        searchQuery,
        setSearchQuery,
        creatingOrder,
        creatingPathaoOrder,
        selectedCourier,
        setSelectedCourier,
        showCourierModal,
        setShowCourierModal,
        pendingCourierOrder,
        setPendingCourierOrder,
        statusFilter,
        setStatusFilter,
        sourceFilter,
        setSourceFilter,
        paymentFilter,
        setPaymentFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        selectedIds,
        setSelectedIds,
        bulkUpdating,
        setBulkUpdating,
        pageSize,
        setPageSize,
        pagination,
        fetchOrders,
        handlePageChange,
        handleSortChange,
        handleClearFilters,
        handleToggleRow,
        handleToggleAll,
        handleClearSelection,
        handleBulkStatusChange,
        handleStatusChange,
        handleCreateCourierOrder,
        isCreatingCourierOrder,
        handleCourierSelect,
        handleConfirmCourierOrder,
        handleCancelCourierOrder,
        handleExportCSV,
    };
}
