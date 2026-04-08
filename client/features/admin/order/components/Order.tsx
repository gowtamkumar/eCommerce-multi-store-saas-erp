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
    const [pagination, setPagination] = useState<OrderListPagination>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchOrders = async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                search: search,
                isAdmin: 'true'
            });
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

    return (
        <>
            <OrderList
                orders={orders}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
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
