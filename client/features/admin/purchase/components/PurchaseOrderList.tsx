'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import { PurchaseOrderStatus } from '@/lib/enums/purchase-order.type.enum';
import {
    CheckCircle,
    Eye,
    FileText,
    Filter,
    Plus,
    Search,
    ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import type { PurchaseOrder, PurchaseOrderListProps } from '../types';
import { getPaymentStatusBadge, getStatusBadge } from './comonfun';

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
    const columns = useMemo<DataTableColumn<PurchaseOrder>[]>(() => [
        {
            key: 'date',
            header: 'Order Date',
            className: 'text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono',
            cell: (order) => new Date(order.createdAt).toLocaleDateString(),
        },
        {
            key: 'identity',
            header: 'Identity',
            cell: (order) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-slate-900 dark:text-white font-bold block">{order.referenceNumber}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">{order.id.slice(0, 8)}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'supplier',
            header: 'Entity',
            cell: (order) => (
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{order.supplier?.name || 'Unknown supplier'}</span>
            ),
        },
        {
            key: 'total',
            header: 'Fiscal Total',
            className: 'font-black text-slate-900 dark:text-white font-mono',
            cell: (order) => formatPrice(Number(order.totalAmount) || 0),
        },
        {
            key: 'payment',
            header: 'Fiscal State',
            cell: (order) => getPaymentStatusBadge(order.paymentStatus || 'UNPAID'),
        },
        {
            key: 'lifecycle',
            header: 'Lifecycle',
            cell: (order) => getStatusBadge(order.status),
        },
        {
            key: 'actions',
            header: 'Settings',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (order) => (
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
            ),
        },
    ], [formatPrice, onReceive]);

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

            <DataTable
                data={orders}
                columns={columns}
                getRowKey={(order) => order.id}
                loading={loading && !orders.length}
                loadingLabel="Loading purchase orders..."
                emptyLabel={
                    <div>
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                            <ShoppingBag className="w-8 h-8 text-slate-300" strokeWidth={1} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No matching orders found</p>
                    </div>
                }
                containerClassName="rounded-3xl min-h-[400px]"
                pagination={{
                    page: pagination.page,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange,
                }}
            />
        </div>
    );
}
