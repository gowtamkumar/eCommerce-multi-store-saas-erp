'use client';

import { Calendar } from 'lucide-react';
import type { ProfitLossPreset } from '../../types';

const PRESETS: ProfitLossPreset[] = ['month', 'quarter', 'year', 'all'];

export interface ProfitLossFiltersProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onPresetRange: (preset: ProfitLossPreset) => void;
}

export default function ProfitLossFilters({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onPresetRange,
}: ProfitLossFiltersProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Range Presets:</span>
                {PRESETS.map((preset) => (
                    <button
                        key={preset}
                        onClick={() => onPresetRange(preset)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold uppercase transition-all"
                    >
                        This {preset === 'all' ? 'All Time' : preset}
                    </button>
                ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <span className="text-slate-400 text-xs font-bold">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
                    />
                </div>
            </div>
        </div>
    );
}
