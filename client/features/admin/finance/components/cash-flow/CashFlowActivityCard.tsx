'use client';

import type { CashFlowSegment } from '../../types';
import type { CashFlowActivityConfig } from './cashFlowActivities';

export interface CashFlowActivityCardProps {
    config: CashFlowActivityConfig;
    segment: CashFlowSegment;
    formatPrice: (amount: number) => string;
}

export default function CashFlowActivityCard({ config, segment, formatPrice }: CashFlowActivityCardProps) {
    const Icon = config.icon;
    const netPositive = segment.net >= 0;

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 space-y-6">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{config.title}</h3>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-slate-500">{config.inflowLabel}</span>
                    <span className="text-xs font-black font-mono text-emerald-600">+{formatPrice(segment.inflows)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-slate-500">{config.outflowLabel}</span>
                    <span className="text-xs font-black font-mono text-rose-600">-{formatPrice(segment.outflows)}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{config.netLabel}</span>
                    <span className={`text-sm font-black font-mono ${netPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatPrice(segment.net)}
                    </span>
                </div>
            </div>
        </div>
    );
}
