'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { TrendingUp } from 'lucide-react';
import { memo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getSalesChartSubtitle } from '../../lib/dashboard';
import type { DashboardPeriod, DashboardStats } from '../../types';

const SalesChart = memo(({
    data,
    loading,
    period,
}: {
    data: DashboardStats['salesData'];
    loading: boolean;
    period: DashboardPeriod;
}) => {
    const { formatPrice } = useSettings();

    return (
    <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                    <TrendingUp className="w-6 h-6 text-brand-500" /> Sales Velocity
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {getSalesChartSubtitle(period)}
                </p>
            </div>
        </div>
        <div className="h-[400px] w-full mt-4">
            {loading ? (
                <div className="w-full h-full bg-slate-50 dark:bg-slate-900/30 animate-pulse rounded-[32px]" />
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dy={15} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                            tickFormatter={(value) => formatPrice(Number(value))}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                borderRadius: '24px',
                                border: 'none',
                                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                                color: '#fff',
                                padding: '20px',
                            }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}
                            formatter={(value: number) => [formatPrice(value), 'Sales']}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={6} fillOpacity={1} fill="url(#colorSales)" animationDuration={1500} />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    </div>
    );
});

SalesChart.displayName = 'SalesChart';

export default SalesChart;
