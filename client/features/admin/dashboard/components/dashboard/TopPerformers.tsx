'use client';

import { Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import type { DashboardStats } from '../../types';
import { EmptyState, PanelHeader, ProductThumb, SkeletonList } from './DashboardPrimitives';

const TopPerformers = memo(({
    stats,
    loading,
    formatPrice,
}: {
    stats: DashboardStats | null;
    loading: boolean;
    formatPrice: (value: number) => string;
}) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
            <PanelHeader
                icon={Package}
                title="Top Products"
                subtitle="Best revenue drivers in this period"
                action={<Link href="/admin/products" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">Products</Link>}
            />
            <div className="space-y-4">
                {loading ? (
                    <SkeletonList count={5} className="h-16 rounded-2xl" />
                ) : stats?.topProducts?.length ? (
                    stats.topProducts.map((product, index) => (
                        <Link key={`${product.id}-${index}`} href={`/admin/products/${product.id}`} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all group">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-8 text-center text-sm font-black text-slate-400 font-mono">#{index + 1}</div>
                                <ProductThumb image={product.image} name={product.name} icon={Package} />
                                <div className="min-w-0">
                                    <p className="font-black text-slate-900 dark:text-white text-sm truncate">{product.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.quantity} units sold</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-black text-slate-900 dark:text-white font-mono text-sm">{formatPrice(product.revenue)}</p>
                                <p className="text-[9px] text-brand-500 font-black uppercase tracking-widest">Revenue</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <EmptyState icon={Package} label="No product sales yet" />
                )}
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
            <PanelHeader
                icon={ShoppingBag}
                title="Top Customers"
                subtitle="Highest value buyers in this period"
                action={<Link href="/admin/customers" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">Customers</Link>}
            />
            <div className="space-y-4">
                {loading ? (
                    <SkeletonList count={5} className="h-16 rounded-2xl" />
                ) : stats?.topCustomers?.length ? (
                    stats.topCustomers.map((customer, index) => (
                        <div key={`${customer.id}-${index}`} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-8 text-center text-sm font-black text-slate-400 font-mono">#{index + 1}</div>
                                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-black border border-brand-100 dark:border-brand-900/30 shrink-0">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-slate-900 dark:text-white text-sm truncate">{customer.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{customer.email || 'No email'} · {customer.orderCount} orders</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-black text-slate-900 dark:text-white font-mono text-sm">{formatPrice(customer.revenue)}</p>
                                <p className="text-[9px] text-brand-500 font-black uppercase tracking-widest">Spend</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyState icon={ShoppingBag} label="No customer sales yet" />
                )}
            </div>
        </div>
    </div>
));

TopPerformers.displayName = 'TopPerformers';

export default TopPerformers;
