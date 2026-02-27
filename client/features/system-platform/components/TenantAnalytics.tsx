'use client';

import { motion } from 'framer-motion';
import { Activity, ArrowLeft, BarChart3, Clock, MousePointer2, Store, Users } from 'lucide-react';
import Link from 'next/link';

interface TopPage {
    path: string;
    hits: number;
    lastUpdated: string;
}

interface TenantAnalyticsProps {
    tenantId: string;
    data: {
        counts: {
            users: number;
            products: number;
            orders: number;
            pages: number;
        };
        topPages: TopPage[];
    };
    tenantName: string;
}

export default function TenantAnalytics({ tenantId, data, tenantName }: TenantAnalyticsProps) {
    const stats = [
        { label: 'Merchant Users', value: data.counts.users, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Total Products', value: data.counts.products, icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Customer Orders', value: data.counts.orders, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Store Pages', value: data.counts.pages, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/system-platform"
                    className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                        {tenantName} <span className="text-indigo-600">Analytics</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Store Partition: {tenantId.split('-')[0]}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm"
                    >
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-4`}>
                            <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Top Pages Table */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Top Visited Pages</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Direct path engagement metrics</p>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                            <MousePointer2 className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Path</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hits</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Last Sync</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {data.topPages.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-12 text-center text-slate-400 italic">No traffic data recorded for this cluster</td>
                                    </tr>
                                ) : (
                                    data.topPages.map((page, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-400">0{i + 1}.</span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">{page.path}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black">
                                                    {page.hits.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(page.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Placeholder / Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 flex flex-col shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Store Distribution</h2>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">Live Monitoring</span>
                    </div>
                    <div className="flex-1 space-y-8">
                        {[
                            { label: 'Users', val: data.counts.users, max: data.counts.users * 1.5, color: 'bg-indigo-500' },
                            { label: 'Products', val: data.counts.products, max: data.counts.products * 1.5, color: 'bg-emerald-500' },
                            { label: 'Orders', val: data.counts.orders, max: data.counts.orders * 1.5, color: 'bg-amber-500' },
                            { label: 'Pages', val: data.counts.pages, max: data.counts.pages * 1.5, color: 'bg-blue-500' },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{item.val}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.val / item.max) * 100}%` }}
                                        className={`h-full ${item.color}`}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-700 mt-auto">
                            <p className="text-xs text-slate-500 italic">
                                Metric distribution calculated based on active store partition resource allocation.
                                Request more capacity from the infrastructure panel if usage exceeds 80%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
