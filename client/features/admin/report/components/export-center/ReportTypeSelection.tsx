'use client';

import React from 'react';
import type { ReportTypeSelectionProps } from '../../types';



const ReportTypeSelection: React.FC<ReportTypeSelectionProps> = ({ reports, currentType, onTypeChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 delay-150 font-display">
            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Available Reports</h3>
            <div className="space-y-3">
                {reports.map((report) => {
                    const isActive = currentType === report.id;
                    return (
                        <button
                            key={report.id}
                            onClick={() => onTypeChange(report.id)}
                            className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 flex items-center gap-5 group ${isActive
                                    ? 'bg-white dark:bg-slate-800 border-brand-600 shadow-xl shadow-brand-500/10 transform scale-[1.03]'
                                    : 'bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${isActive
                                    ? report.color
                                    : 'bg-slate-100 dark:bg-slate-800 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100'
                                }`}>
                                <report.icon className={`w-7 h-7 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-base font-black transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                                    {report.name}
                                </h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed mt-0.5">{report.description}</p>
                            </div>
                            {isActive && (
                                <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(ReportTypeSelection);
