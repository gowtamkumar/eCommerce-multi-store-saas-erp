'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import type { CashFlowChartItem } from '../types';
import { BarChart3 } from 'lucide-react';

interface CashFlowChartProps {
    chartData: CashFlowChartItem[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ chartData }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-600" />
                    Liquidity Trend (Last 30 Days)
                </h3>
            </div>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickFormatter={(val) => `${val}`}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff'
                            }}
                        />
                        <Bar dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} name="Cash In" />
                        <Bar dataKey="outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} name="Cash Out" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default React.memo(CashFlowChart);
