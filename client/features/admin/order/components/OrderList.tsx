'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { PaymentStatus } from '@/lib/enums/payment-status.enum';
import { CourierType } from '@/lib/enums/courier-type.enum';
import { getOrderStatusStyles } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Eye, Loader2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import type { OrderListProps } from '../type';

export default function OrderList({
    orders,
    loading,
    searchQuery,
    onSearchChange,
    pagination,
    onPageChange,
    onStatusChange,
    onCourierSelect,
    selectedCourier
}: OrderListProps) {
    const { formatPrice } = useSettings();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Orders</h1>

            {/* Search Bar & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Link
                        href="/admin/orders/create"
                        className="flex-1 sm:flex-none px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Create Order
                    </Link>
                    <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Total: <span className="text-slate-900 dark:text-white">{pagination.total}</span>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500 scrollbar-track-transparent">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Order ID</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Customer</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Total</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Payment Status</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Date</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Courier</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                                            <span className="font-medium">Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 italic">
                                        {searchQuery ? 'No orders match your search query.' : 'No orders found in the system.'}
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-brand-500 transition-colors">
                                                #{order.id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{order.customerName}</span>
                                                <span className="text-xs text-slate-500 truncate max-w-[150px]">
                                                    {order.items?.length > 1
                                                        ? `${order.items[0]?.product?.name} + ${order.items.length - 1} more`
                                                        : order.items?.[0]?.product?.name || 'Manual Order'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                                {formatPrice(order.totalAmount || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                order.paymentStatus === PaymentStatus.PAID
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : order.paymentStatus === PaymentStatus.FAILED
                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {order.paymentStatus || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => onStatusChange(order.id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer outline-none border-transparent focus:ring-2 focus:ring-brand-500/20 transition-all ${getOrderStatusStyles(order.status)}`}
                                            >
                                                <option value={OrderStatus.PENDING}>Pending</option>
                                                <option value={OrderStatus.PROCESSING}>Processing</option>
                                                <option value={OrderStatus.SHIPPED}>Shipped</option>
                                                <option value={OrderStatus.COMPLETED}>Completed</option>
                                                <option value={OrderStatus.CANCELLED}>Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {order.courierStatus ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                                                            {order.courierStatus === 'MANUAL' ? 'DISPATCHED' : order.courierStatus}
                                                        </span>
                                                        {order.trackingId && (
                                                            <a
                                                                href={order.courierStatus.toLowerCase() === CourierType.PATHAO.toString() ? 'https://tracking.pathao.com/' : 'https://steadfast.com.bd/tracking'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-slate-400 hover:text-brand-600 transition-colors"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <select
                                                    value={selectedCourier[order.id] || ''}
                                                    onChange={(e) => onCourierSelect(order, e.target.value)}
                                                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer hover:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                                >
                                                    <option value="">🚚 Ship Order</option>
                                                    <option value={CourierType.STEADFAST}>Steadfast</option>
                                                    <option value={CourierType.PATHAO}>Pathao</option>
                                                    <option value={CourierType.IN_STORE}>Manual</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all inline-block"
                                                title="View Order Details"
                                            >
                                                <Eye className="w-4.5 h-4.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:divide-slate-700 flex items-center justify-between">
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                            Page {pagination.page} of {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2 mx-auto sm:mx-0">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page === 1 || loading}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages || loading}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
