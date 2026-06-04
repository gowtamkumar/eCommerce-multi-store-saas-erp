'use client';

import { Scale, TrendingUp, type LucideIcon } from 'lucide-react';
import type { FinancialView } from '../../types';

const TABS: { key: FinancialView; label: string; icon: LucideIcon }[] = [
    { key: 'overview', label: 'Profit & Loss', icon: TrendingUp },
    { key: 'balance', label: 'Balance Sheet', icon: Scale },
];

export interface FinancialViewTabsProps {
    activeView: FinancialView;
    onViewChange: (view: FinancialView) => void;
}

export default function FinancialViewTabs({ activeView, onViewChange }: FinancialViewTabsProps) {
    return (
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
            {TABS.map(({ key, label, icon: Icon }) => (
                <button
                    key={key}
                    onClick={() => onViewChange(key)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeView === key
                            ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <Icon className="w-4 h-4" />
                    {label}
                </button>
            ))}
        </div>
    );
}
