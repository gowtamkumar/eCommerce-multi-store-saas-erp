'use client';

import { ChevronRight } from 'lucide-react';
import type { BalanceSheetData } from '../../types';
import { BALANCE_SHEET_SECTIONS } from '../balance-sheet/balanceSheetSections';

export interface BalanceOverviewProps {
    bsData: BalanceSheetData | null;
    formatPrice: (amount: number) => string;
}

export default function BalanceOverview({ bsData, formatPrice }: BalanceOverviewProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {BALANCE_SHEET_SECTIONS.map((section) => {
                const Icon = section.icon;
                const { color, title } = section;
                const items = bsData?.[section.key] || [];
                const total = bsData?.[section.totalKey] || 0;
                return (
                    <div key={title} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className={`p-2.5 bg-${color}-50 dark:bg-${color}-900/20`}>
                                <Icon className={`w-5 h-5 text-${color}-600`} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h4>
                        </div>
                        <div className="space-y-3">
                            {items.length === 0 && (
                                <p className="text-sm text-slate-400 text-center py-4">No data yet</p>
                            )}
                            {items.map((item) => (
                                <div key={item.name} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3 text-slate-300" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                                    </div>
                                    <span className={`text-sm font-bold text-${color}-600 dark:text-${color}-400`}>{formatPrice(item.balance)}</span>
                                </div>
                            ))}
                        </div>
                        <div className={`mt-4 pt-4 border-t-2 border-${color}-100 dark:border-${color}-900/30 flex items-center justify-between`}>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">Total {title}</span>
                            <span className={`text-lg font-black text-${color}-600`}>{formatPrice(total)}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
