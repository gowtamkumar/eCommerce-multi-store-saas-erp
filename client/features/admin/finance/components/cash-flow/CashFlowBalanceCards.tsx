'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp } from 'lucide-react';

export interface CashFlowBalanceCardsProps {
    startingBalance: number;
    netChange: number;
    endingBalance: number;
    formatPrice: (amount: number) => string;
}

export default function CashFlowBalanceCards({
    startingBalance,
    netChange,
    endingBalance,
    formatPrice,
}: CashFlowBalanceCardsProps) {
    const netPositive = netChange >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
            >
                <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Starting Balance</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {formatPrice(startingBalance)}
                    </span>
                </div>
                <DollarSign className="w-8 h-8 text-slate-400" />
            </motion.div>

            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
            >
                <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Net Change in Cash</span>
                    <span className={`text-2xl font-black font-mono flex items-center gap-1 ${netPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {netPositive ? '+' : ''}{formatPrice(netChange)}
                    </span>
                </div>
                {netPositive ? (
                    <ArrowUpRight className="w-8 h-8 text-emerald-600" />
                ) : (
                    <ArrowDownRight className="w-8 h-8 text-rose-600" />
                )}
            </motion.div>

            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
            >
                <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ending Cash Balance</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {formatPrice(endingBalance)}
                    </span>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-600" />
            </motion.div>
        </div>
    );
}
