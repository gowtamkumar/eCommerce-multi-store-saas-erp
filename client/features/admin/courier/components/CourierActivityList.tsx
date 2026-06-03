'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import type { CourierActivityListProps, TrackedOrder } from '../types';

export default function CourierActivityList({
    orders,
    loading,
    searchQuery,
    onSearchChange
}: CourierActivityListProps) {
    const columns = useMemo<DataTableColumn<TrackedOrder>[]>(() => [
        {
            key: 'assignment',
            header: 'Assignment',
            cell: (order) => (
                <>
                    <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-black text-slate-900 dark:text-white hover:text-brand-600 transition-colors tracking-tight"
                    >
                        #{order.id.slice(-8).toUpperCase()}
                    </Link>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </>
            ),
        },
        {
            key: 'consignee',
            header: 'Consignee',
            cell: (order) => (
                <>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{order.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{order.customerPhone}</p>
                </>
            ),
        },
        {
            key: 'partner',
            header: 'Partner',
            cell: (order) => (
                <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    order.courierStatus === 'Pathao'
                        ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20'
                        : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20'
                }`}>
                    {order.courierStatus}
                </span>
            ),
        },
        {
            key: 'tracking',
            header: 'Identification',
            cell: (order) => (
                <code className="text-[11px] font-black text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg">
                    {order.trackingId || 'N/A'}
                </code>
            ),
        },
        {
            key: 'lifecycle',
            header: 'Lifecycle',
            cell: () => (
                <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 uppercase tracking-widest">
                    In Transit
                </span>
            ),
        },
        {
            key: 'utility',
            header: 'Utility',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (order) => (
                <div className="flex justify-end pr-4">
                    {order.trackingId && (
                        <a
                            href={order.courierStatus?.toLowerCase() === 'pathao' ? 'https://tracking.pathao.com/' : 'https://steadfast.com.bd/tracking'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all border border-transparent hover:border-brand-100"
                            title="Track Shipment"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>
            ),
        },
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Fulfillment Activity</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live shipment tracking logs</p>
                </div>
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID, customer or tracking token..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <DataTable
                data={orders}
                columns={columns}
                getRowKey={(order) => order.id}
                loading={loading}
                loadingLabel="Loading courier activity..."
                emptyLabel={
                    <div>
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                            <ExternalLink className="w-8 h-8 text-slate-300" strokeWidth={1} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {searchQuery ? 'Zero intersection with search criteria' : 'No transmission activity recorded'}
                        </p>
                    </div>
                }
                containerClassName="rounded-3xl"
                rowClassName="animate-in fade-in duration-300"
            />
        </div>
    );
}
