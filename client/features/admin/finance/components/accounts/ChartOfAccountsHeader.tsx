'use client';

import { Database, Plus, Search } from 'lucide-react';

export interface ChartOfAccountsHeaderProps {
    searchQuery: string;
    hasAccounts: boolean;
    onSearchChange: (value: string) => void;
    onInitializeCoa: () => void;
    onAddAccount: () => void;
    currencyCode?: string;
    currencySymbol?: string;
}

export default function ChartOfAccountsHeader({
    searchQuery,
    hasAccounts,
    onSearchChange,
    onInitializeCoa,
    onAddAccount,
    currencyCode,
    currencySymbol,
}: ChartOfAccountsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                    Chart of <span className="text-indigo-600">Accounts</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                    General Ledger Structure &amp; Account Classifications
                    {currencyCode && currencySymbol && (
                        <span className="ml-2 text-indigo-600 dark:text-indigo-400 normal-case tracking-normal font-black">
                            · {currencyCode} ({currencySymbol})
                        </span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative group w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                    <input
                        type="text"
                        placeholder="Search by code or name..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
                    />
                </div>
                {hasAccounts ? (
                    <button
                        onClick={onAddAccount}
                        className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Account
                    </button>
                ) : (
                    <button
                        onClick={onInitializeCoa}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Database className="w-4 h-4" /> Seed System COA
                    </button>
                )}
            </div>
        </div>
    );
}
