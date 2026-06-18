'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import { CourierType } from '@/lib/enums/courier-type.enum';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { PaymentStatus } from '@/lib/enums/payment-status.enum';
import { getOrderStatusStyles } from '@/lib/utils';
import { Eye, Loader2, Search, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Order, OrderListProps } from '../type';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const SOURCE_LABELS: Record<string, string> = {
    website: '🌐 Website Storefront',
    pos: '🏪 POS Register',
    manual: '✍️ Manual Admin',
};

const PAYMENT_LABELS: Record<string, string> = {
    paid: '🟢 Paid',
    pending: '🟡 Pending',
    failed: '🔴 Failed',
};

const STATUS_LABELS: Record<string, string> = {
    [OrderStatus.PENDING]: '⌛ Pending',
    [OrderStatus.PROCESSING]: '⚙️ Processing',
    [OrderStatus.CONFIRMED]: '📝 Confirmed',
    [OrderStatus.SHIPPED]: '🚚 Shipped',
    [OrderStatus.COMPLETED]: '✅ Completed',
    [OrderStatus.CANCELLED]: '❌ Cancelled',
};

export default function OrderList({
    orders,
    loading,
    searchQuery,
    onSearchChange,

    // Premium Filters
    statusFilter = '',
    onStatusFilterChange,
    sourceFilter = '',
    onSourceFilterChange,
    paymentFilter = '',
    onPaymentFilterChange,
    onClearFilters,
    onExportCSV,

    pagination,
    onPageChange,
    onStatusChange,
    onOpenAiAssist,
    onCourierSelect,
    selectedCourier,
    isCreatingCourierOrder,

    // Sorting
    sortBy,
    sortOrder,
    onSortChange,

    // Bulk selection
    selectedIds,
    onToggleRow,
    onToggleAll,
    onClearSelection,
    onBulkStatusChange,
    bulkUpdating,

    // Page size
    pageSize,
    onPageSizeChange,
}: OrderListProps) {
    const { formatPrice } = useSettings();

    const hasActiveFilters = Boolean(statusFilter || sourceFilter || paymentFilter || searchQuery);
    const selectedCount = selectedIds.size;

    const summaryRange = useMemo(() => {
        if (pagination.total === 0) return null;
        const start = (pagination.page - 1) * pagination.limit + 1;
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        return { start, end };
    }, [pagination.limit, pagination.page, pagination.total]);

    const columns = useMemo<DataTableColumn<Order>[]>(() => [
        {
            key: 'order',
            header: 'Order ID',
            cell: (order) => (
                <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-brand-500 transition-colors">
                        #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${order.orderSource === 'pos'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : order.orderSource === 'manual'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
                        }`}>
                        {order.orderSource || 'website'}
                    </span>
                </div>
            ),
        },
        {
            key: 'customer',
            header: 'Customer',
            sortKey: 'customerName',
            cell: (order) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{order.customerName}</span>
                    <span className="text-xs text-slate-500 truncate max-w-[150px]">
                        {order.items?.length > 1
                            ? `${order.items[0]?.product?.name} + ${order.items.length - 1} more`
                            : order.items?.[0]?.product?.name || 'Manual Order'}
                    </span>
                </div>
            ),
        },
        {
            key: 'total',
            header: 'Total',
            sortKey: 'totalAmount',
            cell: (order) => (
                <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatPrice(order.totalAmount || 0)}
                </span>
            ),
        },
        {
            key: 'payment',
            header: 'Payment Status',
            sortKey: 'paymentStatus',
            cell: (order) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${order.paymentStatus === PaymentStatus.PAID || order.paymentStatus === PaymentStatus.COMPLETED
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : order.paymentStatus === PaymentStatus.FAILED
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                    {order.paymentStatus || 'PENDING'}
                </span>
            ),
        },
        {
            key: 'date',
            header: 'Date',
            sortKey: 'createdAt',
            className: 'text-xs font-medium text-slate-500',
            cell: (order) => (
                <div className="flex flex-col">
                    <span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    <span className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortKey: 'status',
            cell: (order) => (
                <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer outline-none border-transparent focus:ring-2 focus:ring-brand-500/20 transition-all ${getOrderStatusStyles(order.status)}`}
                >
                    <option value={OrderStatus.PENDING}>Pending</option>
                    <option value={OrderStatus.PROCESSING}>Processing</option>
                    <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                    <option value={OrderStatus.SHIPPED}>Shipped</option>
                    <option value={OrderStatus.COMPLETED}>Completed</option>
                    <option value={OrderStatus.CANCELLED}>Cancelled</option>
                </select>
            ),
        },
        {
            key: 'courier',
            header: 'Courier',
            className: 'text-xs',
            cell: (order) => {
                const courierBusy = isCreatingCourierOrder(order.id);
                if (order.courierStatus) {
                    return (
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
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                            {order.trackingId && (
                                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={order.trackingId}>
                                    {order.trackingId}
                                </span>
                            )}
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedCourier[order.id] || ''}
                            onChange={(e) => onCourierSelect(order, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={courierBusy}
                            className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer hover:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all disabled:opacity-60 disabled:cursor-wait"
                        >
                            <option value="">Ship Order</option>
                            <option value={CourierType.STEADFAST}>Steadfast</option>
                            <option value={CourierType.PATHAO}>Pathao</option>
                            <option value={CourierType.IN_STORE}>Manual</option>
                        </select>
                        {courierBusy && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />}
                    </div>
                );
            },
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (order) => (
                <div className="flex items-center justify-end gap-1">
                    {onOpenAiAssist && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenAiAssist(order, 'email');
                            }}
                            className="p-2.5 text-violet-500 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-all"
                            title="AI customer email draft"
                        >
                            <Sparkles className="w-4 h-4" />
                        </button>
                    )}
                    <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all inline-block"
                        title="View Order Details"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Eye className="w-4.5 h-4.5" />
                    </Link>
                </div>
            ),
        },
    ], [formatPrice, isCreatingCourierOrder, onCourierSelect, onOpenAiAssist, onStatusChange, selectedCourier]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Orders</h1>

            {/* Search Bar & Actions */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by customer, email, phone, ID, product..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {onExportCSV && (
                            <button
                                onClick={onExportCSV}
                                className="flex-1 sm:flex-none px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                Export CSV
                            </button>
                        )}
                        <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            Total: <span className="text-slate-900 dark:text-white font-bold">{pagination.total}</span>
                        </div>
                    </div>
                </div>

                {/* Glassmorphic Filtering Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {/* Sales Channel Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Sales Channel</label>
                        <select
                            value={sourceFilter}
                            onChange={(e) => onSourceFilterChange?.(e.target.value)}
                            className="px-3 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-brand-500 outline-none transition-all"
                        >
                            <option value="">📱 All Channels</option>
                            <option value="website">🌐 Website Storefront</option>
                            <option value="pos">🏪 POS Register</option>
                            <option value="manual">✍️ Manual Admin</option>
                        </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Payment Status</label>
                        <select
                            value={paymentFilter}
                            onChange={(e) => onPaymentFilterChange?.(e.target.value)}
                            className="px-3 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-brand-500 outline-none transition-all"
                        >
                            <option value="">💵 All Payment Statuses</option>
                            <option value="paid">🟢 Paid</option>
                            <option value="pending">🟡 Pending</option>
                            <option value="failed">🔴 Failed</option>
                        </select>
                    </div>

                    {/* Fulfillment Status Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Fulfillment Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange?.(e.target.value)}
                            className="px-3 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-brand-500 outline-none transition-all"
                        >
                            <option value="">📦 All Fulfillment Statuses</option>
                            <option value={OrderStatus.PENDING}>⌛ Pending</option>
                            <option value={OrderStatus.PROCESSING}>⚙️ Processing</option>
                            <option value={OrderStatus.CONFIRMED}>📝 Confirmed</option>
                            <option value={OrderStatus.SHIPPED}>🚚 Shipped</option>
                            <option value={OrderStatus.COMPLETED}>✅ Completed</option>
                            <option value={OrderStatus.CANCELLED}>❌ Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Active filter chips */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active:</span>
                        {searchQuery && (
                            <FilterChip label={`Search: "${searchQuery}"`} onClear={() => onSearchChange('')} />
                        )}
                        {sourceFilter && (
                            <FilterChip label={SOURCE_LABELS[sourceFilter] || sourceFilter} onClear={() => onSourceFilterChange?.('')} />
                        )}
                        {paymentFilter && (
                            <FilterChip label={PAYMENT_LABELS[paymentFilter] || paymentFilter} onClear={() => onPaymentFilterChange?.('')} />
                        )}
                        {statusFilter && (
                            <FilterChip label={STATUS_LABELS[statusFilter] || statusFilter} onClear={() => onStatusFilterChange?.('')} />
                        )}
                        <button
                            onClick={onClearFilters}
                            className="ml-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 underline underline-offset-2"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Bulk action bar */}
            {selectedCount > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-700 dark:text-brand-300">
                        <span>{selectedCount} order{selectedCount > 1 ? 's' : ''} selected</span>
                        <button
                            onClick={onClearSelection}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-2"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {bulkUpdating && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Set status:</span>
                        <select
                            defaultValue=""
                            disabled={bulkUpdating}
                            onChange={(e) => {
                                if (e.target.value) {
                                    onBulkStatusChange(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-brand-500 outline-none transition-all disabled:opacity-60"
                        >
                            <option value="" disabled>Choose status…</option>
                            <option value={OrderStatus.PENDING}>Pending</option>
                            <option value={OrderStatus.PROCESSING}>Processing</option>
                            <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                            <option value={OrderStatus.SHIPPED}>Shipped</option>
                            <option value={OrderStatus.COMPLETED}>Completed</option>
                            <option value={OrderStatus.CANCELLED}>Cancelled</option>
                        </select>
                    </div>
                </div>
            )}

            <DataTable
                data={orders}
                columns={columns}
                getRowKey={(order) => order.id}
                loading={loading}
                loadingLabel="Loading orders..."
                emptyLabel={hasActiveFilters ? 'No orders match your search query.' : 'No orders found in the system.'}
                minWidthClassName="min-w-[1000px]"
                sort={{ sortBy, sortOrder, onSortChange }}
                selection={{
                    selectedKeys: selectedIds,
                    onToggleRow: (key) => onToggleRow(key),
                    onToggleAll: (rows) => onToggleAll(rows),
                }}
                pagination={{
                    page: pagination.page,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange,
                }}
                paginationSummary={
                    <div className="flex items-center gap-4">
                        {summaryRange && (
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                                Showing {summaryRange.start}–{summaryRange.end} of {pagination.total}
                            </p>
                        )}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rows</span>
                            <select
                                value={pageSize}
                                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                className="px-2 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer outline-none"
                            >
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                }
            />
        </div>
    );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            {label}
            <button onClick={onClear} className="text-slate-400 hover:text-rose-500 transition-colors" title="Remove filter">
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}
