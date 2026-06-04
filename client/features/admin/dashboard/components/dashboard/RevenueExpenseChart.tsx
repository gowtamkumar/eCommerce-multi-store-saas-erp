'use client';

import { BarChart3 } from 'lucide-react';
import { memo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardStats } from '../../types';
import { PanelHeader } from './DashboardPrimitives';

const RevenueExpenseChart = memo(({
    stats,
    loading,
}: {
    stats: DashboardStats | null;
    loading: boolean;
}) => {
    const totalExpenses = (stats?.financeSnapshot?.cogs || 0) + (stats?.financeSnapshot?.operatingExpenses || 0);
    const data = [
        { name: 'Revenue', amount: stats?.financeSnapshot?.revenue || 0 },
        { name: 'COGS', amount: stats?.financeSnapshot?.cogs || 0 },
        { name: 'Opex', amount: stats?.financeSnapshot?.operatingExpenses || 0 },
        { name: 'Total Cost', amount: totalExpenses },
        { name: 'Net', amount: stats?.financeSnapshot?.netProfit || 0 },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
            <PanelHeader icon={BarChart3} title="Revenue vs Cost" subtitle="Period profitability bridge" />
            <div className="h-[300px]">
                {loading ? (
                    <div className="w-full h-full bg-slate-50 dark:bg-slate-900/30 animate-pulse rounded-[32px]" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderRadius: '20px',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '14px',
                                }}
                            />
                            <Bar dataKey="amount" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
});

RevenueExpenseChart.displayName = 'RevenueExpenseChart';

export default RevenueExpenseChart;
