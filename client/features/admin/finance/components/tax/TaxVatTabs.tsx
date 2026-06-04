'use client';

import type { TaxVatTab } from '../../types';

interface TabConfig {
    id: TaxVatTab;
    label: string;
}

const TAX_TABS: TabConfig[] = [
    { id: 'filing', label: 'Tax Filing Returns' },
    { id: 'rules', label: 'Jurisdiction Rules' },
    { id: 'sandbox', label: 'Calculator Sandbox' },
];

export interface TaxVatTabsProps {
    activeTab: TaxVatTab;
    onTabChange: (tab: TaxVatTab) => void;
}

export default function TaxVatTabs({ activeTab, onTabChange }: TaxVatTabsProps) {
    return (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
            {TAX_TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
