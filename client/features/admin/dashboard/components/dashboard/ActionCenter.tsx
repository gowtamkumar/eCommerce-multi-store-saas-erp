'use client';

import { Activity, ChevronRight, History as HistoryIcon, Package, ShoppingBag, Truck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { memo, useMemo } from 'react';
import { ACTION_TONES } from '../../lib/dashboard';
import type { ActionCenterItem, DashboardStats } from '../../types';
import { SkeletonList } from './DashboardPrimitives';

const ActionCenter = memo(({
    stats,
    loading,
    formatPrice,
}: {
    stats: DashboardStats | null;
    loading: boolean;
    formatPrice: (value: number) => string;
}) => {
    const items = useMemo<ActionCenterItem[]>(() => {
        const fulfillmentPending = stats?.fulfillment?.pending || 0;
        const fulfillmentPicking = stats?.fulfillment?.picking || 0;
        const lowStock = stats?.lowStockCount || 0;
        const activeOrders = stats?.activeOrders || 0;
        const payableDue = stats?.supplierStats?.totalAmountDue || 0;
        const purchaseOrders = stats?.supplierStats?.totalPurchaseOrders || 0;

        return [
            {
                label: 'Active Orders',
                value: activeOrders,
                detail: 'Orders waiting for confirmation, shipment, or completion.',
                href: '/admin/orders',
                icon: ShoppingBag,
                tone: activeOrders > 0 ? 'blue' : 'slate',
            },
            {
                label: 'Fulfillment Queue',
                value: fulfillmentPending,
                detail: `${fulfillmentPicking} currently in picking workflow.`,
                href: '/admin/fulfillment',
                icon: Truck,
                tone: fulfillmentPending > 0 ? 'amber' : 'slate',
            },
            {
                label: 'Low Stock',
                value: lowStock,
                detail: 'Items below reorder threshold and needing replenishment.',
                href: '/admin/inventory',
                icon: Package,
                tone: lowStock > 0 ? 'rose' : 'emerald',
            },
            {
                label: 'Payables Due',
                value: formatPrice(payableDue),
                detail: 'Supplier balance requiring payment follow-up.',
                href: '/admin/finance/ap',
                icon: Wallet,
                tone: payableDue > 0 ? 'amber' : 'slate',
            },
            {
                label: 'Purchase Orders',
                value: purchaseOrders,
                detail: 'Open procurement pipeline and receiving workflow.',
                href: '/admin/procurement/purchases',
                icon: HistoryIcon,
                tone: purchaseOrders > 0 ? 'blue' : 'slate',
            },
        ];
    }, [formatPrice, stats]);

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                        <Activity className="w-6 h-6 text-brand-500" /> ERP Action Center
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Exceptions and work queues that need attention
                    </p>
                </div>
                <Link href="/admin/notifications" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">
                    Notifications
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                {loading ? (
                    <SkeletonList count={5} className="h-32 rounded-3xl" />
                ) : (
                    items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`p-5 rounded-3xl border transition-all hover:-translate-y-0.5 hover:shadow-lg group ${ACTION_TONES[item.tone]}`}
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-11 h-11 rounded-2xl bg-white/70 dark:bg-slate-950/20 flex items-center justify-center shadow-sm">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div className="text-3xl font-black font-mono leading-none">{item.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest mt-2">{item.label}</div>
                                <p className="text-[11px] font-semibold opacity-70 mt-2 leading-snug">{item.detail}</p>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
});

ActionCenter.displayName = 'ActionCenter';

export default ActionCenter;
