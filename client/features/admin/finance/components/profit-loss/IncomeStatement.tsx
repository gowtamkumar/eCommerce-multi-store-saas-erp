'use client';

import { BarChart3 } from 'lucide-react';
import type { PLData } from '../../types';
import IncomeStatementRow from './IncomeStatementRow';
import NetIncomeCard from './NetIncomeCard';

export interface IncomeStatementProps {
    data: PLData | null;
    expandRevenue: boolean;
    onToggleRevenue: () => void;
    expandCogs: boolean;
    onToggleCogs: () => void;
    expandExpenses: boolean;
    onToggleExpenses: () => void;
    netMargin: string;
    isProfitable: boolean;
    formatPrice: (amount: number) => string;
}

export default function IncomeStatement({
    data,
    expandRevenue,
    onToggleRevenue,
    expandCogs,
    onToggleCogs,
    expandExpenses,
    onToggleExpenses,
    netMargin,
    isProfitable,
    formatPrice,
}: IncomeStatementProps) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" /> Multi-Step Income Statement
            </h2>

            <div className="space-y-4">
                <IncomeStatementRow
                    sign="+"
                    label="Total Operating Revenues"
                    amount={data?.revenue || 0}
                    amountColorClass="text-indigo-600"
                    expanded={expandRevenue}
                    onToggle={onToggleRevenue}
                    breakdown={data?.revenueBreakdown}
                    emptyLabel="No transaction records found for Revenue accounts."
                    formatPrice={formatPrice}
                />

                <IncomeStatementRow
                    sign="-"
                    label="Cost of Goods Sold (COGS)"
                    amount={data?.costOfGoodsSold || 0}
                    amountColorClass="text-amber-600"
                    expanded={expandCogs}
                    onToggle={onToggleCogs}
                    breakdown={data?.cogsBreakdown}
                    emptyLabel="No transaction records found for Cost of Goods Sold accounts."
                    formatPrice={formatPrice}
                />

                <div className="flex justify-between items-center py-4 bg-slate-50 dark:bg-slate-900 px-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <span className="w-4 text-slate-400 font-black text-sm">=</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Gross Profit</span>
                    </div>
                    <span className="text-base font-black text-emerald-600 font-mono">{formatPrice(data?.grossProfit || 0)}</span>
                </div>

                <IncomeStatementRow
                    sign="-"
                    label="Operating & Admin Expenses"
                    amount={data?.operatingExpenses || 0}
                    amountColorClass="text-rose-600"
                    expanded={expandExpenses}
                    onToggle={onToggleExpenses}
                    breakdown={data?.operatingExpBreakdown}
                    emptyLabel="No transaction records found for Operating Expense accounts."
                    formatPrice={formatPrice}
                />

                <NetIncomeCard
                    netProfit={data?.netProfit || 0}
                    netMargin={netMargin}
                    isProfitable={isProfitable}
                    formatPrice={formatPrice}
                />
            </div>
        </div>
    );
}
