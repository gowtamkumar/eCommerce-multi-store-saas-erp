'use client';

import React, { useMemo } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import { useCartsDashboard } from '../hooks/useCartsDashboard';
import { CartSummary } from '../types';

export default function CartsList() {
    const { formatPrice } = useSettings();
    const {
        carts,
        loading,
        searchQuery,
        setSearchQuery,
        pagination,
        handlePageChange,
    } = useCartsDashboard();

    const columns = useMemo<DataTableColumn<CartSummary>[]>(() => [
        {
            key: 'id',
            header: 'Cart ID',
            cell: (cart) => (
                <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-brand-500 transition-colors">
                    #{cart.id.slice(-8).toUpperCase()}
                </span>
            ),
        },
        {
            key: 'customer',
            header: 'Customer',
            cell: (cart) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {cart.customerName}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[200px]">
                        {cart.customerEmail || cart.customerPhone || 'Guest Configuration'}
                    </span>
                </div>
            ),
        },
        {
            key: 'items',
            header: 'Items Count',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (cart) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                    {cart.itemCount} items
                </span>
            ),
        },
        {
            key: 'value',
            header: 'Rough Value',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (cart) => (
                <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatPrice(cart.totalAmount || 0)}
                </span>
            ),
        },
        {
            key: 'updated',
            header: 'Last Modified',
            className: 'text-xs font-medium text-slate-500',
            cell: (cart) => cart.updatedAt ? new Date(cart.updatedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
            }) : '-',
        },
    ], [formatPrice]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8 relative inline-flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                Active Carts
            </h1>

            {/* Search Bar & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by customer name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Total Users with Cart: <span className="text-slate-900 dark:text-white font-black">{pagination.total}</span>
                    </div>
                </div>
            </div>

            <DataTable
                data={carts}
                columns={columns}
                getRowKey={(cart) => cart.id}
                loading={loading}
                loadingLabel="Loading carts..."
                emptyLabel={searchQuery ? 'No carts match your search query.' : 'No active carts found in the system.'}
                minWidthClassName="min-w-[1000px]"
                pagination={{
                    page: pagination.page,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange: handlePageChange,
                }}
            />
        </div>
    );
}
