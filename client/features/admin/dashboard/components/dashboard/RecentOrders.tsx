'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { ORDER_STATUS_STYLES } from '../../lib/dashboard';
import type { DashboardStats } from '../../types';
import { EmptyState, PanelHeader, SkeletonList } from './DashboardPrimitives';

export default function RecentOrders({
    stats,
    loading,
    formatPrice,
}: {
    stats: DashboardStats | null;
    loading: boolean;
    formatPrice: (value: number) => string;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
            <PanelHeader
                icon={ShoppingBag}
                title="Recent Orders"
                action={<Link href="/admin/orders" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">View All</Link>}
            />
            <div className="space-y-4">
                {loading ? (
                    <SkeletonList count={3} className="h-20 rounded-2xl" />
                ) : stats?.recentOrders?.length ? (
                    stats.recentOrders.map((order) => (
                        <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:rotate-12 transition-transform">
                                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-sm">#{String(order.id).substring(0, 8)}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{order.customerName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-slate-900 dark:text-white font-mono text-sm">{formatPrice(order.totalAmount)}</p>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${ORDER_STATUS_STYLES[String(order.status).toLowerCase()] || 'bg-slate-100 text-slate-500'}`}>
                                    {order.status}
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <EmptyState icon={ShoppingBag} label="No recent orders" className="py-20 rounded-[32px]" />
                )}
            </div>
        </div>
    );
}
