'use client';

import { Package } from 'lucide-react';
import Link from 'next/link';
import type { DashboardStats } from '../../types';
import { ProductThumb, SkeletonList } from './DashboardPrimitives';

export default function LowStockGrid({
    stats,
    loading,
}: {
    stats: DashboardStats | null;
    loading: boolean;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                    <Package className="w-6 h-6 text-rose-500" /> Stock Deficiency
                </h3>
                <Link href="/admin/products?status=active" className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">Replenish Inventory</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <SkeletonList count={3} className="h-24 rounded-3xl" />
                ) : stats?.lowStockProducts?.length ? (
                    stats.lowStockProducts.map((item) => (
                        <Link key={item.id} href={`/admin/products/${item.id}`} className="flex items-center justify-between p-5 rounded-[32px] bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-900/20 hover:border-rose-500/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="group-hover:scale-110 transition-transform shadow-sm rounded-2xl">
                                    <ProductThumb image={item.image} name={item.name} icon={Package} sizeClassName="w-14 h-14" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">{item.name}</p>
                                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-0.5">Alert Level: {item.threshold}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">In Stock</p>
                                <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-600 font-mono">
                                    {item.stock}
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
                        <Package className="w-12 h-12 text-slate-100 mx-auto" strokeWidth={1} />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4 italic">No critical deplete detected</p>
                    </div>
                )}
            </div>
        </div>
    );
}
