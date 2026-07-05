'use client';

import { Award, Plus, RefreshCw } from 'lucide-react';
import type { DynamicRulesTabProps } from '../types';
import LoyaltyRuleCard from './LoyaltyRuleCard';

export default function DynamicRulesTab({
    rules,
    loadingRules,
    onAddRule,
    onEditRule,
    onDeleteRule,
}: DynamicRulesTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dynamic Rules & Multipliers</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Create dynamic points rules based on item categories, minimum order spends, or weekend triggers.
                    </p>
                </div>
                <button
                    onClick={onAddRule}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-all text-sm font-bold shadow-md shadow-brand-500/10 active:scale-95 animate-in fade-in"
                >
                    <Plus className="w-4 h-4" /> Add Rule
                </button>
            </div>

            {loadingRules && rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800">
                    <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
                    <p className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-widest animate-pulse">Loading rules...</p>
                </div>
            ) : rules.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-900 space-y-3">
                    <Award className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
                    <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">No Dynamic Rules Defined</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Set up category points multipliers, weekend multipliers, or minimum spend points bonuses to drive customer behavior.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rules.map((rule) => (
                        <LoyaltyRuleCard
                            key={rule.id}
                            rule={rule}
                            onEdit={onEditRule}
                            onDelete={onDeleteRule}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
