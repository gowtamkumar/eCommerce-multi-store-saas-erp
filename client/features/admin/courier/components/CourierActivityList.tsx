'use client';

import { Search, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { CourierActivityListProps } from '../types';

export default function CourierActivityList({
    orders,
    loading,
    searchQuery,
    onSearchChange
}: CourierActivityListProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer or tracking..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Courier</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tracking ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex justify-center items-center gap-2 text-slate-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Loading activity...
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                        {searchQuery ? 'No matching tracked orders found.' : 'No courier activity recorded yet.'}
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="font-bold text-slate-900 dark:text-white hover:text-brand-600 transition-colors"
                                            >
                                                #{order.id.slice(-8).toUpperCase()}
                                            </Link>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900 dark:text-white">{order.customerName}</p>
                                            <p className="text-xs text-slate-500">{order.customerPhone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.courierStatus === 'Pathao' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {order.courierStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                                            {order.trackingId || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase">
                                                Shipped
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.trackingId && (
                                                <a
                                                    href={order.courierStatus?.toLowerCase() === 'pathao' ? 'https://tracking.pathao.com/' : 'https://steadfast.com.bd/tracking'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                                                    title="Track Shipment"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
