'use client';

import { Calendar, Edit2, Trash2 } from 'lucide-react';
import { getRulePresentation } from '../lib/loyalty';
import type { LoyaltyRuleCardProps } from '../types';

export default function LoyaltyRuleCard({ rule, onEdit, onDelete }: LoyaltyRuleCardProps) {
    const { badgeColor, typeLabel, valueDisplay } = getRulePresentation(rule);
    const isCategory = rule.type === 'CATEGORY_MULTIPLIER';
    const isSpend = rule.type === 'MIN_SPEND_BONUS';
    const isWeekend = rule.type === 'WEEKEND_MULTIPLIER';

    return (
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                        {typeLabel}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${rule.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                    >
                        {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{rule.name}</h4>
                    <p className="text-2xl font-black text-brand-600 dark:text-brand-400 font-mono mt-1">{valueDisplay}</p>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
                    {isCategory && (
                        <p className="text-slate-500 dark:text-slate-400 flex items-start gap-1.5 font-mono text-[11px] break-all">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Category ID:</span>
                            {String(rule.conditions?.categoryId || 'Any')}
                        </p>
                    )}
                    {isSpend && (
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Min Spend Required:</span>
                            <strong className="text-slate-800 dark:text-white font-mono">${Number(rule.conditions?.minSpend || rule.conditions?.threshold || 0).toLocaleString()}</strong>
                        </p>
                    )}
                    {isWeekend && (
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Weekend Days:</span>
                            Saturday & Sunday
                        </p>
                    )}

                    {(rule.startDate || rule.endDate) && (
                        <div className="space-y-1 text-[11px] text-slate-400 dark:text-slate-500">
                            {rule.startDate && (
                                <p className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Start: {new Date(rule.startDate).toLocaleString()}
                                </p>
                            )}
                            {rule.endDate && (
                                <p className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> End: {new Date(rule.endDate).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 border-t border-slate-200 dark:border-slate-800 pt-3.5">
                <button
                    onClick={() => onEdit(rule)}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                    title="Edit Rule"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                {rule.id && (
                    <button
                        onClick={() => onDelete(rule.id!)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                        title="Delete Rule"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
