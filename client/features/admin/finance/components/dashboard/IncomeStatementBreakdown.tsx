'use client';

import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';
import type { ProfitLossSummary } from '../../types';

interface WaterfallRow {
    label: string;
    value: number;
    color: string;
    textColor: string;
    sign: string;
    bold?: boolean;
}

export interface IncomeStatementBreakdownProps {
    plData: ProfitLossSummary | null;
    isProfitable: boolean;
    formatPrice: (amount: number) => string;
}

export default function IncomeStatementBreakdown({ plData, isProfitable, formatPrice }: IncomeStatementBreakdownProps) {
    const maxVal = plData?.revenue || 1;

    const rows: WaterfallRow[] = [
        { label: 'Revenue', value: plData?.revenue || 0, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400', sign: '+' },
        { label: 'Cost of Goods Sold', value: plData?.costOfGoodsSold || 0, color: 'bg-amber-400', textColor: 'text-amber-600 dark:text-amber-400', sign: '-' },
        { label: 'Gross Profit', value: plData?.grossProfit || 0, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', sign: '=', bold: true },
        { label: 'Operating Expenses', value: plData?.operatingExpenses || 0, color: 'bg-rose-400', textColor: 'text-rose-600 dark:text-rose-400', sign: '-' },
        { label: 'Net Profit', value: plData?.netProfit || 0, color: isProfitable ? 'bg-violet-600' : 'bg-rose-600', textColor: isProfitable ? 'text-violet-600 dark:text-violet-400' : 'text-rose-600 dark:text-rose-400', sign: '=', bold: true },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-violet-600" />
                Income Statement Breakdown
            </h4>
            <div className="space-y-4">
                {rows.map((row) => {
                    const barWidth = Math.min(Math.abs(row.value / maxVal) * 100, 100);
                    return (
                        <div key={row.label} className={row.bold ? 'mt-6 pt-6 border-t border-slate-100 dark:border-slate-800' : ''}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center text-lg font-black text-slate-400">{row.sign}</span>
                                    <span className={`text-sm ${row.bold ? 'font-black text-slate-900 dark:text-white' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>{row.label}</span>
                                </div>
                                <span className={`text-sm font-black ${row.textColor}`}>{formatPrice(row.value)}</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-9">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full ${row.color} rounded-full`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
