'use client';

import { LeadStatus } from '@/lib/enums/lead-status.enum';
import { Filter, Search } from 'lucide-react';
import type { LeadsFiltersProps } from '../type';

function formatStatus(status: string) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function LeadsFilters({
    searchQuery,
    statusFilter,
    total,
    onSearchChange,
    onStatusChange,
}: LeadsFiltersProps) {
    return (
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Leads..."
                        value={searchQuery}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="relative min-w-[160px]">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(event) => onStatusChange(event.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none transition-all cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        {Object.values(LeadStatus).map((status) => (
                            <option key={status} value={status}>
                                {formatStatus(status)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                Total: {total} subscribers
            </div>
        </div>
    );
}
