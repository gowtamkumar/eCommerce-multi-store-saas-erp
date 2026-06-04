'use client';

import { History as HistoryIcon, Package, Truck } from 'lucide-react';
import Link from 'next/link';
import type { DashboardStats } from '../../types';
import { EmptyState, PanelHeader, SkeletonList } from './DashboardPrimitives';

export default function RecentPurchases({
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
                icon={HistoryIcon}
                title="Recent Purchases"
                action={<Link href="/admin/procurement/purchases" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">View Ledger</Link>}
            />
            <div className="space-y-4">
                {loading ? (
                    <SkeletonList count={3} className="h-20 rounded-2xl" />
                ) : stats?.supplierStats?.recentPurchaseOrders?.length ? (
                    stats.supplierStats.recentPurchaseOrders.map((po) => (
                        <Link key={po.id} href={`/admin/procurement/purchases/${po.id}`} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:rotate-12 transition-transform">
                                    <Package className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-sm">{po.referenceNumber}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{po.supplier?.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-slate-900 dark:text-white font-mono text-sm">{formatPrice(po.totalAmount)}</p>
                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-500">{po.status}</span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <EmptyState icon={Truck} label="Empty active pool" className="py-20 rounded-[32px]" />
                )}
            </div>
        </div>
    );
}
