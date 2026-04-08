'use client';

import { BarChart3, ShoppingBag, Users } from 'lucide-react';
import React from 'react';
import { SalesDashboardData } from '../types';

interface SalesStatsGridProps {
    data: SalesDashboardData | null;
    isLoading: boolean;
    formatPrice: (price: number) => string;
}

export default function SalesStatsGrid({ data, isLoading, formatPrice }: SalesStatsGridProps) {
    if (isLoading && !data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse h-32" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Sales */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-brand-50 dark:bg-brand-900/30 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Sales (Period)</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(data?.periodSales || 0)}</h3>
                    </div>
                </div>
                {data?.monthlyGrowth !== null && data?.monthlyGrowth !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                        <span className={`text-xs font-bold ${data.monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {data.monthlyGrowth >= 0 ? '+' : ''}{data.monthlyGrowth.toFixed(1)}%
                        </span>
                        <span className="text-xs text-slate-400">vs last period</span>
                    </div>
                )}
            </div>

            {/* Total Orders */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                        <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Orders (Period)</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data?.periodOrders || 0}</h3>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{data?.activeOrders || 0}</span> PENDING orders
                </p>
            </div>

            {/* Total Customers */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Customers</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data?.counts?.users || 0}</h3>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Registered audience</p>
            </div>
        </div>
    );
}
