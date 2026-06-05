'use client';

import { Award } from 'lucide-react';
import type { LoyaltyConfig, LoyaltyRule } from '../../types';

export interface LoyaltyRulesCardProps {
    config: LoyaltyConfig | null;
    rules: LoyaltyRule[];
    formatPrice: (price: number) => string;
}

export default function LoyaltyRulesCard({ config, rules, formatPrice }: LoyaltyRulesCardProps) {
    return (
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-brand-600" />
                    Loyalty Point Rules
                </h3>
                <div className="space-y-4">
                    {config && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl space-y-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Base Exchange Rules</p>
                            <p className="text-[11px] text-slate-500">
                                Earn: {config.pointsPerCurrencySpent || 1} pt per {formatPrice(1)} spent
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Redeem: {config.pointsRequiredPerCurrencyDiscount || 100} pts for {formatPrice(1)} off
                            </p>
                        </div>
                    )}
                    <div className="space-y-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Special Rules</p>
                        {rules.length === 0 ? (
                            <p className="text-xs text-slate-500 font-semibold italic">No custom rules active</p>
                        ) : (
                            rules.map((rule, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{rule.name || rule.ruleType}</span>
                                    <span className="font-mono font-bold text-brand-600">+{rule.pointsAwarded || rule.rewardPoints} pts</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
