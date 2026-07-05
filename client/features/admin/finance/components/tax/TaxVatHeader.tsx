'use client';

import { Landmark, Plus, RefreshCw } from 'lucide-react';
import type { TaxVatTab } from '../../types';

export interface TaxVatHeaderProps {
    activeTab: TaxVatTab;
    hasRules: boolean;
    onSeedDefaults: () => void;
    onCreateRule: () => void;
    onRefresh: () => void;
    currencyCode?: string;
    currencySymbol?: string;
}

export default function TaxVatHeader({
    activeTab,
    hasRules,
    onSeedDefaults,
    onCreateRule,
    onRefresh,
    currencyCode,
    currencySymbol,
}: TaxVatHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Landmark className="w-8 h-8 text-indigo-600" /> Tax &amp; VAT Engine
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                    Multi-jurisdiction automated VAT calculations, Input Tax credits, and output filing returns
                    {currencyCode && currencySymbol && (
                        <span className="ml-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            · {currencyCode} ({currencySymbol})
                        </span>
                    )}
                </p>
            </div>

            <div className="flex items-center gap-2">
                {activeTab === 'rules' && !hasRules && (
                    <button
                        onClick={onSeedDefaults}
                        className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                        Seed Standard Rules
                    </button>
                )}

                {activeTab === 'rules' && (
                    <button
                        onClick={onCreateRule}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Rule
                    </button>
                )}

                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-xs font-black uppercase tracking-widest"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>
        </div>
    );
}
