'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { PurchaseOrderStatus } from '@/lib/enums/purchase-order.type.enum';
import {
    CheckCircle,
    ChevronLeft, ChevronRight,
    Eye,
    FileText,
    Filter,
    Plus,
    Search,
    ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import type { PurchaseOrderListProps } from '../types';
import { getPaymentStatusBadge, getStatusBadge } from './comonfun';

const PurchaseOrderRow = memo(({ order, onReceive, formatPrice }: {
    order: any,
    onReceive: (id: string) => void,
    formatPrice: (p: number) => string
}) => {

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                {new Date(order.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-slate-900 dark:text-white font-bold block">{order.referenceNumber}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">{order.id.slice(0, 8)}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{order.supplier?.name}</span>
            </td>
            <td className="px-6 py-4 font-black text-slate-900 dark:text-white font-mono">
                {formatPrice(order.totalAmount)}
            </td>
            <td className="px-6 py-4">
                {getPaymentStatusBadge(order.paymentStatus)}
            </td>
            <td className="px-6 py-4">
                {getStatusBadge(order.status)}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Link
                        href={`/admin/procurement/purchases/${order.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    {order.status !== PurchaseOrderStatus.RECEIVED && order.status !== PurchaseOrderStatus.CANCELLED && (
                        <button
                            onClick={() => onReceive(order.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                            title="Mark as Received"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
});

PurchaseOrderRow.displayName = 'PurchaseOrderRow';

export default function PurchaseOrderList({
    orders,
    loading,
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    pagination,
    onPageChange,
    onReceive,
    isSearchLoading
}: PurchaseOrderListProps) {
    const { formatPrice } = useSettings();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Purchase Orders</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-brand-500" />
                        Manage procurement cycle & supplier relationships
                    </p>
                </div>
                <Link
                    href="/admin/procurement/purchases/new"
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-500/25 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Order
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearchLoading ? 'text-brand-500 animate-spin' : 'text-slate-400 group-focus-within:text-brand-500'}`} />
                    <input
                        type="text"
                        placeholder="Search reference # or supplier name..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
                    />
                </div>
                <div className="relative w-full md:w-56">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                        <option value="">All Statuses</option>
                        <option value={PurchaseOrderStatus.DRAFT}>Draft</option>
                        <option value={PurchaseOrderStatus.PENDING}>Pending</option>
                        <option value={PurchaseOrderStatus.RECEIVED}>Received</option>
                        <option value={PurchaseOrderStatus.CANCELLED}>Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Date</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Entity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fiscal Total</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fiscal State</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lifecycle</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading && !orders.length ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-6 py-8">
                                            <div className="h-12 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr key={1}>
                                    <td colSpan={7} className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                                            <ShoppingBag className="w-8 h-8 text-slate-300" strokeWidth={1} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No matching orders found</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <PurchaseOrderRow
                                        key={order.id}
                                        order={order}
                                        onReceive={onReceive}
                                        formatPrice={formatPrice}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Index <span className="text-slate-900 dark:text-white px-1">{pagination.page}</span> of <span className="text-slate-900 dark:text-white px-1">{pagination.totalPages}</span>
                            <span className="ml-2 text-slate-400 font-bold">({pagination.total} ENTITIES)</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
