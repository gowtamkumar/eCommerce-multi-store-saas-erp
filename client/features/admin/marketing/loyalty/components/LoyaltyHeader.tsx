'use client';

import type { LoyaltyHeaderProps, LoyaltySubTab } from '../types';

const TABS: Array<{ id: LoyaltySubTab; label: string }> = [
    { id: 'rules', label: 'Program Rules' },
    { id: 'adjust', label: 'Points Adjustment' },
    { id: 'dynamic', label: 'Dynamic Rules' },
];

export default function LoyaltyHeader({ activeTab, onTabChange }: LoyaltyHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Loyalty & Referrals Engine
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Configure points conversion rates, membership tier thresholds, and award manually managed points adjustments.
                </p>
            </div>
            <div className="flex bg-white dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-200/50 dark:border-slate-700 shadow-sm shrink-0">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
