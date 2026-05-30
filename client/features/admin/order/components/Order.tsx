'use client';
import { useDebounce } from '@/hooks/useDebounce';
import { CourierType } from '@/lib/enums/courier-type.enum';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { fetchAPI } from '@/services/api';
import { handleCreatePathaoOrder, handleCreateSteadfastOrder, handleManualDispatch, updateOrderStatus } from '@/lib/utils';
import type { Order } from '@/types/order';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CourierModal from './CourierModal';
import OrderList from './OrderList';
import type { OrderListPagination } from '../type';

export default function Order() {
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

    const [pagination, setPagination] = useState<OrderListPagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchOrders = async (
        page: number, 
        search: string, 
        status = statusFilter, 
        source = sourceFilter, 
        payment = paymentFilter
    ) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                search: search,
                isAdmin: 'true'
            });
            if (status) params.append('status', status);
            if (source) params.append('orderSource', source);
            if (payment) params.append('paymentStatus', payment);

            const res = await fetchAPI(`/orders?${params}`);

            if (res.data?.orders) {
                setOrders(res.data.orders);
                setPagination(res.data.pagination);
            } else if (res.success && Array.isArray(res.data)) {
                // Fallback for different API response structure
                setOrders(res.data);
                if (res.pagination) {
                    setPagination(res.pagination);
                }
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(1, debouncedSearch);
    }, [debouncedSearch]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchOrders(newPage, debouncedSearch);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const result = await updateOrderStatus(id, { status: newStatus });

        if (result.success) {
            setOrders(prev => prev.map((o) => o.id === id ? { ...o, status: newStatus as OrderStatus } : o));
            toast.success('Order status updated');
        } else {
            toast.error(result.error || 'Error updating status');
        }
    };

    const handleCreateCourierOrder = async (order: Order, courier: string) => {
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
            // Refresh logic if needed, or local state update as done above for MANUAL
            if (courier !== CourierType.IN_STORE) {
                fetchOrders(pagination.page, debouncedSearch);
            }
        } catch (error) {
            console.error('Courier order creation failed', error);
        }
    };

    const isCreatingCourierOrder = (orderId: string) => {
        return creatingOrder === orderId || creatingPathaoOrder === orderId;
    };

    const handleCourierSelect = (order: Order, courier: string) => {
        if (courier) {
            setPendingCourierOrder({ order, courier });
            setShowCourierModal(true);
        }
    };

    const handleConfirmCourierOrder = async () => {
        if (pendingCourierOrder) {
            const { order, courier } = pendingCourierOrder;
            setShowCourierModal(false);
            setSelectedCourier(prev => ({ ...prev, [order.id]: courier }));
            await handleCreateCourierOrder(order, courier);
            setPendingCourierOrder(null);
        }
    };

    const handleCancelCourierOrder = () => {
        setShowCourierModal(false);
        setPendingCourierOrder(null);
        // Reset the select value for that order
        if (pendingCourierOrder) {
            setSelectedCourier(prev => {
                const newState = { ...prev };
                delete newState[pendingCourierOrder.order.id];
                return newState;
            });
        }
    };

    // Premium Excel/CSV spreadsheet exporter
    const handleExportCSV = async () => {
        const toastId = toast.loading('Preparing CSV spreadsheet...');
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '1000',
                search: debouncedSearch,
                isAdmin: 'true'
            });
            if (statusFilter) params.append('status', statusFilter);
            if (sourceFilter) params.append('orderSource', sourceFilter);
            if (paymentFilter) params.append('paymentStatus', paymentFilter);

            const res = await fetchAPI(`/orders?${params}`);
            const dataToExport = res.data?.orders || res.data || [];

            if (!Array.isArray(dataToExport) || dataToExport.length === 0) {
                toast.error('No orders found with current filters', { id: toastId });
                return;
            }

            // CSV Columns Header
            let csv = '\ufeffOrder ID,Customer Name,Customer Email,Customer Phone,Sales Channel,Total Amount,Payment Method,Payment Status,Fulfillment Status,Created Date\n';

            dataToExport.forEach((o: any) => {
                const cleanName = (o.customerName || '').replace(/"/g, '""');
                const cleanEmail = (o.customerEmail || '').replace(/"/g, '""');
                const cleanPhone = (o.customerPhone || '').replace(/"/g, '""');
                const channel = o.orderSource || 'website';
                const total = o.totalAmount || 0;
                const method = o.paymentMethod || 'N/A';
                const payStatus = o.paymentStatus || 'PENDING';
                const fulfillStatus = o.status || 'PENDING';
                const created = new Date(o.createdAt).toLocaleString();

                csv += `"${o.id}","${cleanName}","${cleanEmail}","${cleanPhone}","${channel}",${total},"${method}","${payStatus}","${fulfillStatus}","${created}"\n`;
            });

            // Browser download trigger
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Spreadsheet exported successfully!', { id: toastId });
        } catch (error) {
            console.error('Export failed', error);
            toast.error('Failed to export orders to CSV', { id: toastId });
        }
    };

    return (
        <>
            <OrderList
                orders={orders}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                
                // Pass filter properties
                statusFilter={statusFilter}
                onStatusFilterChange={(val: string) => {
                    setStatusFilter(val);
                    fetchOrders(1, debouncedSearch, val, sourceFilter, paymentFilter);
                }}
                sourceFilter={sourceFilter}
                onSourceFilterChange={(val: string) => {
                    setSourceFilter(val);
                    fetchOrders(1, debouncedSearch, statusFilter, val, paymentFilter);
                }}
                paymentFilter={paymentFilter}
                onPaymentFilterChange={(val: string) => {
                    setPaymentFilter(val);
                    fetchOrders(1, debouncedSearch, statusFilter, sourceFilter, val);
                }}
                
                onExportCSV={handleExportCSV}
                pagination={pagination}
                onPageChange={handlePageChange}
                onStatusChange={handleStatusChange}
                onCourierSelect={handleCourierSelect}
                selectedCourier={selectedCourier}
                isCreatingCourierOrder={isCreatingCourierOrder}
            />

            <CourierModal
                isOpen={showCourierModal}
                onClose={handleCancelCourierOrder}
                onConfirm={handleConfirmCourierOrder}
                pendingOrder={pendingCourierOrder}
                isCreating={pendingCourierOrder ? isCreatingCourierOrder(pendingCourierOrder.order.id) : false}
            />
        </>
    );
}
