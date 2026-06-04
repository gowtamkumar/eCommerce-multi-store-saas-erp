'use client';

import { Calendar } from 'lucide-react';

export interface TaxFilingFiltersProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
}

export default function TaxFilingFilters({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: TaxFilingFiltersProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Filing Period</span>
            </div>
            <div className="flex gap-3 items-center">
                <input
                    type="date"
                    value={startDate}
                    onChange={(event) => onStartDateChange(event.target.value)}
                    className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
                />
                <span className="text-slate-400 text-xs font-bold">to</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(event) => onEndDateChange(event.target.value)}
                    className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
                />
            </div>
        </div>
    );
}
