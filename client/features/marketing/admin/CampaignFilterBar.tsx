'use client';

import { Filter, RefreshCcw, Search } from 'lucide-react';
import type { CampaignFilterBarProps } from './types';

export default function CampaignFilterBar({
    searchQuery,
    loading,
    onSearchChange,
    onRefresh,
}: CampaignFilterBarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search campaigns by name..."
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-none focus:ring-2 focus:ring-brand-500/20 text-sm font-medium outline-none transition-all"
                />
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onRefresh}
                    className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-500 hover:text-brand-500 transition-colors"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-500 text-sm font-bold uppercase tracking-widest">
                    <Filter className="w-4 h-4" />
                    Status
                </button>
            </div>
        </div>
    );
}
