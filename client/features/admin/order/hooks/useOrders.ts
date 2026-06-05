'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useApiList } from '@/hooks/useApiList';
import { fetchAPI } from '@/services/api';
import { CourierType } from '@/lib/enums/courier-type.enum';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { handleCreatePathaoOrder, handleCreateSteadfastOrder, handleManualDispatch, updateOrderStatus } from '@/lib/utils';
import type { Order } from '@/types/order';
import type { OrderListPagination, OrderSortOrder } from '../type';

const EXPORT_PAGE_LIMIT = 100;
const EXPORT_MAX_PAGES = 100;

export function useOrders() {
    const [searchQuery, setSearchQuery] = useState('');
    const [creatingOrder, setCreatingOrder] = useState<string | null>(null);
    const [creatingPathaoOrder, setCreatingPathaoOrder] = useState<string | null>(null);
    const [selectedCourier, setSelectedCourier] = useState<{ [orderId: string]: string }>({});
    const [showCourierModal, setShowCourierModal] = useState(false);
    const [pendingCourierOrder, setPendingCourierOrder] = useState<{ order: Order; courier: string } | null>(null);

    const [statusFilter, setStatusFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');

    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<OrderSortOrder>('DESC');

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkUpdating, setBulkUpdating] = useState(false);

    const [pageSize, setPageSize] = useState(10);

    const buildEndpoint = useCallback(
        (page: number) => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                search: searchQuery,
                isAdmin: 'true',
                sortBy,
                sortOrder,
            });
            if (statusFilter) params.append('status', statusFilter);
            if (sourceFilter) params.append('orderSource', sourceFilter);
            if (paymentFilter) params.append('paymentStatus', paymentFilter);
            return `/orders?${params}`;
        },
        [searchQuery, sortBy, sortOrder, statusFilter, sourceFilter, paymentFilter, pageSize],
    );

    const {
        items: orders,
        setItems: setOrders,
        loading,
        pagination,
        refresh,
        handlePageChange: basePageChange,
        resetToFirstPage,
        fetchPage,
    } = useApiList<Order>({
        buildEndpoint,
        pageSize,
        searchQuery,
        debounceMs: 500,
        useAbort: true,
        errorMessage: 'Failed to load orders',
        deps: [statusFilter, sourceFilter, paymentFilter, sortBy, sortOrder, pageSize],
        parseResponse: (res, page, limit) => {
            const data = res.data as { orders?: Order[]; pagination?: OrderListPagination } | Order[] | undefined;
            if (data && typeof data === 'object' && !Array.isArray(data) && Array.isArray(data.orders)) {
                return {
                    items: data.orders,
                    pagination: data.pagination ?? {
                        total: data.orders.length,
                        page,
                        limit,
                        totalPages: 1,
                    },
                };
            }
            const items = Array.isArray(data) ? data : [];
            return {
                items,
                pagination: (res.pagination as OrderListPagination | undefined) ?? {
                    total: items.length,
                    page,
                    limit,
                    totalPages: 1,
                },
            };
        },
    });

    useEffect(() => {
        setSelectedIds(new Set());
        resetToFirstPage();
    }, [statusFilter, sourceFilter, paymentFilter, sortBy, sortOrder, pageSize, searchQuery, resetToFirstPage]);

    const handlePageChange = useCallback(
        (newPage: number) => {
            if (newPage >= 1 && newPage <= pagination.totalPages) {
                setSelectedIds(new Set());
                basePageChange(newPage);
            }
        },
        [pagination.totalPages, basePageChange],
    );

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
    }, [selectedIds, handleClearSelection, setOrders]);

    const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
        const result = await updateOrderStatus(id, { status: newStatus });

        if (result.success) {
            setOrders(prev => prev.map((o) => o.id === id ? { ...o, status: newStatus as OrderStatus } : o));
            toast.success('Order status updated');
        } else {
            toast.error(result.error || 'Error updating status');
        }
    }, [setOrders]);

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
                refresh(pagination.page);
            }
        } catch (error) {
            console.error('Courier order creation failed', error);
        }
    }, [pagination.page, refresh, setOrders]);

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
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: EXPORT_PAGE_LIMIT.toString(),
                    search: searchQuery,
                    isAdmin: 'true',
                    sortBy,
                    sortOrder,
                });
                if (statusFilter) params.append('status', statusFilter);
                if (sourceFilter) params.append('orderSource', sourceFilter);
                if (paymentFilter) params.append('paymentStatus', paymentFilter);

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
    }, [searchQuery, sortBy, sortOrder, statusFilter, sourceFilter, paymentFilter, escapeCsv]);

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
        pagination: pagination as OrderListPagination,
        fetchOrders: fetchPage,
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
