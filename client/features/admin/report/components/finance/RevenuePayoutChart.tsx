'use client';

import { TrendingUp } from 'lucide-react';
import { memo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RevenuePayoutChartProps } from '../../types';


const RevenuePayoutChart = memo(({ chartData, isLoading, formatPrice, currencySymbol }: RevenuePayoutChartProps) => {
    const formatAxisValue = (val: number) => {
        if (val >= 1_000_000) return `${currencySymbol}${(val / 1_000_000).toFixed(val >= 10_000_000 ? 0 : 1)}M`;
        if (val >= 1_000) return `${currencySymbol}${(val / 1_000).toFixed(val >= 10_000 ? 0 : 1)}k`;
        return `${currencySymbol}${val}`;
    };

    if (isLoading && chartData.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse h-[450px]" />
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-brand-600" />
                    Revenue vs Payouts
                </h3>
            </div>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                            </linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            tickFormatter={formatAxisValue}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '16px',
                                color: '#fff',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                            }}
                            cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                            formatter={(value: unknown, name: string) => [
                                formatPrice(Number(value || 0)),
                                name === 'revenue' ? 'Revenue' : 'Payouts',
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="revenue"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRev)"
                            animationDuration={1500}
                        />
                        <Area
                            type="monotone"
                            dataKey="expense"
                            name="expense"
                            stroke="#f43f5e"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorExp)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {isLoading && (
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
                    <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
});

RevenuePayoutChart.displayName = 'RevenuePayoutChart';
export default RevenuePayoutChart;
