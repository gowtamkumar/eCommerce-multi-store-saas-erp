'use client';

import { fetchAPI } from '@/services/api';

import { useSettings } from '@/hooks/SettingsContext';
import { useDebounce } from '@/hooks/useDebounce';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { PaymentStatus } from '@/lib/enums/payment-status.enum';
import { getOrderStatusStyles, handleCreatePathaoOrder, handleCreateSteadfastOrder, updateOrderStatus } from '@/lib/utils';
import { Order } from '@/types/order';
import { ChevronLeft, ChevronRight, Eye, Loader2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pagination } from '../../customer/type';
import { CourierType } from '@/lib/enums/courier-type.enum';


export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState({} as any);
    const [creatingOrder, setCreatingOrder] = useState<string | null>(null);
    const [creatingPathaoOrder, setCreatingPathaoOrder] = useState<string | null>(null);
    const [selectedCourier, setSelectedCourier] = useState<{ [orderId: string]: string }>({});
    const [showCourierModal, setShowCourierModal] = useState(false);
    const [pendingCourierOrder, setPendingCourierOrder] = useState<{ order: Order; courier: string } | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });
    const { formatPrice } = useSettings();
    const debouncedSearch = useDebounce(searchQuery, 500);


    useEffect(() => {
        fetchOrders(1, debouncedSearch);
    }, [debouncedSearch]);

    const fetchOrders = async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search: search
            });
            const res = await fetchAPI(`/orders?${params}`);

            if (res.data?.orders) {
                setOrders(res.data.orders);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchOrders(newPage, debouncedSearch);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const result = await updateOrderStatus(id, { status: newStatus });

        if (result.success) {
            setOrders(orders.map((o: any) => o.id === id ? { ...o, status: newStatus } : o));

            if (selectedOrder && selectedOrder?.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            toast.success('Order status updated');
        } else {
            toast.error(result.error || 'Error updating status');
        }
    };

    const handleCreateCourierOrder = async (order: Order, courier: string) => {
        if (courier === 'steadfast') {
            await handleCreateSteadfastOrder(order, setCreatingOrder);
        } else if (courier === 'pathao') {
            await handleCreatePathaoOrder(order, setCreatingPathaoOrder);
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
            setSelectedCourier({ ...selectedCourier, [order.id]: courier });
            await handleCreateCourierOrder(order, courier);
            setPendingCourierOrder(null);
        }
    };

    const handleCancelCourierOrder = () => {
        setShowCourierModal(false);
        setPendingCourierOrder(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Orders</h1>

            {/* Search Bar */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/orders/create"
                        className="px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Create Order
                    </Link>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Total: {pagination.total} orders
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500 scrollbar-track-transparent">
                    <table className="w-full text-left min-w-[640px]">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Order ID</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Customer</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Unit Price</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Total</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Discount</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Payment</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Payment Status</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden xl:table-cell">Date</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Courier</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Loading orders...
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                                        {searchQuery ? 'No orders match your search.' : 'No orders found.'}
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-500 font-mono text-[10px] sm:text-xs whitespace-nowrap">{order.id.slice(-8).toUpperCase()}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="text-slate-900 dark:text-white font-medium text-xs sm:text-sm">{order.customerName}</div>
                                            <div className="text-[10px] sm:text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[200px]">
                                                {order.items?.length > 1
                                                    ? `${order.items[0]?.product?.name} + ${order.items.length - 1} more`
                                                    : order.items?.[0]?.product?.name || 'No Items'}
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-600 dark:text-slate-300 text-xs sm:text-sm hidden md:table-cell">
                                            {formatPrice(order.items?.[0]?.unitPrice || 0)}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-600 dark:text-slate-300 font-semibold text-xs sm:text-sm">{formatPrice(order.totalAmount || 0)}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                            {order.items?.some((i: any) => Number(i.discountAmount) > 0) ? (
                                                <span className="text-red-500 text-sm">
                                                    -{formatPrice(order.items.reduce((acc: number, item: any) => acc + (Number(item.discountAmount) * item.quantity), 0))}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-600 dark:text-slate-300 capitalize text-xs sm:text-sm hidden lg:table-cell">{order.paymentMethod}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === PaymentStatus.PAID
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : order.paymentStatus === PaymentStatus.FAILED
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {order.paymentStatus || PaymentStatus.PENDING}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-500 text-xs sm:text-sm hidden xl:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${getOrderStatusStyles(order.status)}`}
                                            >
                                                <option value={OrderStatus.PENDING}>Pending</option>
                                                <option value={OrderStatus.PROCESSING}>Processing</option>
                                                <option value={OrderStatus.SHIPPED}>Shipped</option>
                                                <option value={OrderStatus.COMPLETED}>Completed</option>
                                                <option value={OrderStatus.CANCELLED}>Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            {order.courierStatus ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                                                            {['pathao', 'steadfast'].includes(order.courierStatus.toLowerCase())
                                                                ? order.courierStatus
                                                                : 'DISPATCHED'}
                                                        </span>
                                                        {order.trackingId && (
                                                            <a
                                                                href={order.courierStatus.toLowerCase() === 'pathao' ? 'https://tracking.pathao.com/' : 'https://steadfast.com.bd/tracking'}
                                                                target="_blank"
                                                                className="text-slate-400 hover:text-brand-600"
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-md font-bold uppercase truncate max-w-[100px]">
                                                        Shipment Created
                                                    </span>
                                                </div>
                                            ) : (
                                                <select
                                                    value={selectedCourier[order.id] || ''}
                                                    onChange={(e) => handleCourierSelect(order, e.target.value)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer hover:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                                >
                                                    <option value="">🚚 Create Courier Order</option>
                                                    <option value={CourierType.STEADFAST}>🚚 Steadfast</option>
                                                    <option value={CourierType.PATHAO}>📦 Pathao</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors inline-block"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>

                    <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                    </div>

                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || loading}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            )}

            {/* Courier Confirmation Modal */}
            {showCourierModal && pendingCourierOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full transform transition-all">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Create {pendingCourierOrder.courier === 'pathao' ? 'Pathao' : 'Steadfast'} Order?
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Are you sure you want to create a {pendingCourierOrder.courier === 'pathao' ? 'Pathao' : 'Steadfast'} courier order for order <span className="font-mono font-semibold">{pendingCourierOrder.order.id.slice(-6).toUpperCase()}</span>?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelCourierOrder}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors disabled:opacity-50"
                            >
                                No
                            </button>
                            <button
                                onClick={handleConfirmCourierOrder}
                                disabled={isCreatingCourierOrder(pendingCourierOrder.order.id)}
                                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isCreatingCourierOrder(pendingCourierOrder.order.id) && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Yes, Create Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
