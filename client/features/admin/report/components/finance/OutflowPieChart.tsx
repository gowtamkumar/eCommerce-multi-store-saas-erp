'use client';

import { PieChart } from 'lucide-react';
import { memo } from 'react';
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { OutflowPieChartProps } from '../../types';


const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const OutflowPieChart = memo(({ data, isLoading }: OutflowPieChartProps) => {
    if (isLoading && data.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse h-[220px]" />
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden h-[220px]">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-500" />
                Outflow Breakdown
            </h3>
            <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={50}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '10px'
                            }}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
            {isLoading && (
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
                    <div className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
});

OutflowPieChart.displayName = 'OutflowPieChart';
export default OutflowPieChart;
