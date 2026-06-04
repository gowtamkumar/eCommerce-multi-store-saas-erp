'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AccountBreakdown } from '../../types';

export interface IncomeStatementRowProps {
    sign: string;
    label: string;
    amount: number;
    amountColorClass: string;
    expanded: boolean;
    onToggle: () => void;
    breakdown?: AccountBreakdown[];
    emptyLabel: string;
    formatPrice: (amount: number) => string;
}

export default function IncomeStatementRow({
    sign,
    label,
    amount,
    amountColorClass,
    expanded,
    onToggle,
    breakdown,
    emptyLabel,
    formatPrice,
}: IncomeStatementRowProps) {
    const hasItems = !!breakdown && breakdown.length > 0;

    return (
        <div className="space-y-2">
            <div
                onClick={onToggle}
                className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 px-2 rounded-xl transition-all"
            >
                <div className="flex items-center gap-2">
                    <span className="w-4 text-slate-400 font-black text-sm">{sign}</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
                <span className={`text-sm font-black font-mono ${amountColorClass}`}>{formatPrice(amount)}</span>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-8 space-y-1 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-50 dark:border-slate-700"
                    >
                        {breakdown?.map((acc) => (
                            <div key={acc.code} className="flex justify-between text-xs font-semibold text-slate-500 py-1">
                                <span>[{acc.code}] {acc.name}</span>
                                <span className="font-mono">{formatPrice(acc.balance)}</span>
                            </div>
                        ))}
                        {!hasItems && (
                            <p className="text-xs text-slate-400 py-1">{emptyLabel}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
