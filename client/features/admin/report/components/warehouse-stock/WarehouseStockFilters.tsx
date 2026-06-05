'use client';

import { Search } from 'lucide-react';
import type { WarehouseStockFiltersProps } from '../../types';

export default function WarehouseStockFilters({
    filterCounts,
    activeFilter,
    searchQuery,
    onFilterChange,
    onSearchChange,
}: WarehouseStockFiltersProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2.5">
                {filterCounts.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => onFilterChange(f.key)}
                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${activeFilter === f.key
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none scale-105'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600'
                            }`}
                    >
                        {f.label}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${activeFilter === f.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                            {f.count}
                        </span>
                    </button>
                ))}
            </div>
            <div className="relative w-full lg:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search product name, category, SKU..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm font-medium"
                />
            </div>
        </div>
    );
}
