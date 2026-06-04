'use client';

import type { ApTab } from '../../types';

export interface ApTabsProps {
    activeTab: ApTab;
    unpaidCount: number;
    onTabChange: (tab: ApTab) => void;
}

export default function ApTabs({ activeTab, unpaidCount, onTabChange }: ApTabsProps) {
    const tabClass = (tab: ApTab) =>
        `px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`;

    return (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button onClick={() => onTabChange('aging')} className={tabClass('aging')}>
                AP Aging Dashboard
            </button>
            <button onClick={() => onTabChange('batch-payment')} className={tabClass('batch-payment')}>
                Batch Payment Run ({unpaidCount})
            </button>
        </div>
    );
}
