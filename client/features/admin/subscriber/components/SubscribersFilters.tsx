'use client';

import { Search } from 'lucide-react';
import type { SubscribersFiltersProps } from '../type';

export default function SubscribersFilters({
    searchQuery,
    total,
    onSearchChange,
}: SubscribersFiltersProps) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Scan identities by email..."
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-medium"
                />
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Node Count: {total}
                </span>
            </div>
        </div>
    );
}
