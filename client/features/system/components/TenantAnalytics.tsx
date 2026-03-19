'use client';

import { motion } from 'framer-motion';
import { Activity, ArrowLeft, BarChart3, Clock, MousePointer2, Store, Users, Globe, TrendingUp } from 'lucide-react';
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
        { label: 'Merchant Users', value: data.counts.users, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-500/20' },
        { label: 'Total Products', value: data.counts.products, icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-500/20' },
        { label: 'Customer Orders', value: data.counts.orders, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500/20' },
        { label: 'Store Pages', value: data.counts.pages, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500/20' },
    ];

    return (
        <div className="space-y-10 pb-12">
            <div className="flex items-center gap-6">
                <Link
                    href="/system-platform"
                    className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-110 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-brand-600 transition-colors" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        {tenantName} <span className="text-brand-600">Intelligence</span>
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Cluster Partition: <span className="text-slate-600 dark:text-slate-300">{tenantId}</span></p>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                        className={`bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden active:scale-95`}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-700/20 pointer-events-none opacity-50" />
                        
                        <div className={`w-14 h-14 ${s.bg} dark:bg-slate-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-sm`}>
                            <s.icon className={`w-7 h-7 ${s.color}`} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{s.value.toLocaleString()}</p>
                            <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Traffic Hotspots Table */}
                <div className="bg-white dark:bg-slate-800 rounded-[44px] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <div className="p-10 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Traffic Hotspots</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Resource engagement metrics</p>
                        </div>
                        <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-[24px] shadow-sm">
                            <MousePointer2 className="w-6 h-6 text-brand-600" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/30 dark:bg-slate-900/40">
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Path</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hits</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Last Sync</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {data.topPages.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-10 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <Globe className="w-12 h-12 opacity-20" strokeWidth={1} />
                                                <p className="text-xs font-black uppercase tracking-widest italic">No cluster pulse detected</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data.topPages.map((page, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-black text-slate-300 group-hover:text-brand-500 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tighter group-hover:translate-x-1 transition-transform">{page.path}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className="px-4 py-1.5 bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-black font-mono shadow-sm">
                                                    {page.hits.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-400 uppercase">
                                                    <Clock className="w-3.5 h-3.5" />
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

                {/* Resource Allocation View */}
                <div className="bg-white dark:bg-slate-800 rounded-[44px] border border-slate-100 dark:border-slate-700 p-10 flex flex-col shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Resource Load</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tenant partition distribution</p>
                        </div>
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Real-time</span>
                    </div>
                    <div className="flex-1 space-y-10">
                        {[
                            { label: 'Users', val: data.counts.users, max: Math.max(data.counts.users * 1.5, 10), color: 'bg-indigo-500' },
                            { label: 'Products', val: data.counts.products, max: Math.max(data.counts.products * 1.5, 100), color: 'bg-emerald-500' },
                            { label: 'Orders', val: data.counts.orders, max: Math.max(data.counts.orders * 1.5, 50), color: 'bg-amber-500' },
                            { label: 'Pages', val: data.counts.pages, max: Math.max(data.counts.pages * 1.5, 20), color: 'bg-blue-500' },
                        ].map((item) => (
                            <div key={item.label} className="group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{item.val}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-50 dark:bg-slate-900/50 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((item.val / item.max) * 100, 100)}%` }}
                                        className={`h-full ${item.color} shadow-lg`}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-10 border-t border-slate-100 dark:border-slate-700 mt-auto">
                            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <Activity className="w-5 h-5 text-brand-500 mt-0.5" />
                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight">
                                    Metrics are calculated based on active store partition resource allocation. 
                                    Usage beyond <span className="text-brand-600 font-black italic">85% threshold</span> may require horizontal scaling or partition migration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
