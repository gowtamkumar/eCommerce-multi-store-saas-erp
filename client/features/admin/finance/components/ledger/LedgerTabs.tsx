'use client';

export type LedgerTab = 'double-entry' | 'inventory';

export interface LedgerTabsProps {
    activeTab: LedgerTab;
    onTabChange: (tab: LedgerTab) => void;
}

const TABS: { id: LedgerTab; label: string }[] = [
    { id: 'double-entry', label: 'Financial Journals' },
    { id: 'inventory', label: 'Inventory Movements' },
];

export default function LedgerTabs({ activeTab, onTabChange }: LedgerTabsProps) {
    return (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
            {TABS.map((tab) => (
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
