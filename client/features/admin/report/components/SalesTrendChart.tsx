'use client';

import { memo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SalesTrendChartProps } from '../types';


const SalesTrendChart = memo(({ salesData, isLoading }: SalesTrendChartProps) => {
    if (isLoading && salesData.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="h-8 w-48 bg-slate-100 dark:bg-slate-700 rounded animate-pulse mb-8" />
                <div className="h-[400px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sales Trend (Last 7 Periods)</h3>
            </div>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(val) => `${val}`}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                color: '#fff',
                                padding: '12px'
                            }}
                            itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                            cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                    <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
});

SalesTrendChart.displayName = 'SalesTrendChart';
export default SalesTrendChart;
