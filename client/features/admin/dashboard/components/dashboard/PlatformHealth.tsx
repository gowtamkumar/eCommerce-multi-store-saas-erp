'use client';

import { motion } from 'framer-motion';
import type { HealthItem } from '../../types';

export default function PlatformHealth({ items }: { items: HealthItem[] }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter italic">Platform Health</h3>
            <div className="space-y-6">
                {items.map((item) => (
                    <div key={item.label}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{item.val}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.pct}%` }}
                                className={`h-full ${item.color}`}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
