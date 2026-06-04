'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { BalanceSheetLineItem } from '../../types';
import type { BalanceSheetSection } from './balanceSheetSections';

export interface BalanceSheetSectionCardProps {
    section: BalanceSheetSection;
    items: BalanceSheetLineItem[];
    total: number;
    index: number;
    formatPrice: (amount: number) => string;
}

export default function BalanceSheetSectionCard({
    section,
    items,
    total,
    index,
    formatPrice,
}: BalanceSheetSectionCardProps) {
    const { icon: Icon, color, title, desc } = section;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
        >
            <div className={`p-5 border-b border-slate-100 dark:border-slate-800 bg-${color}-50/50 dark:bg-${color}-900/10`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-${color}-100 dark:bg-${color}-900/30 rounded-2xl`}>
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                        <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-2">
                {items.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-6">No accounts yet</p>
                )}
                {items.map((item, i) => (
                    <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + i * 0.05 }}
                        className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/60 last:border-0"
                    >
                        <div className="flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                        </div>
                        <span className={`text-sm font-bold text-${color}-600 dark:text-${color}-400`}>{formatPrice(item.balance)}</span>
                    </motion.div>
                ))}
            </div>

            <div className={`mx-5 mb-5 p-4 bg-${color}-50 dark:bg-${color}-900/20 rounded-2xl flex items-center justify-between`}>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">Total {title}</span>
                <span className={`text-xl font-black text-${color}-600`}>{formatPrice(total)}</span>
            </div>
        </motion.div>
    );
}
