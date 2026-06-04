'use client';

export type ArTab = 'dashboard' | 'rules' | 'logs';

const TABS: { id: ArTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'rules', label: 'Dunning Rules' },
    { id: 'logs', label: 'Dunning Logs' },
];

export interface ArTabsProps {
    activeTab: ArTab;
    onTabChange: (tab: ArTab) => void;
}

export default function ArTabs({ activeTab, onTabChange }: ArTabsProps) {
    return (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
