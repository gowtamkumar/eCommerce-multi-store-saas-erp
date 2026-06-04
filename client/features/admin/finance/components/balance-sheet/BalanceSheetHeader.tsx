'use client';

import { AlertCircle, CheckCircle2, RefreshCw, Scale } from 'lucide-react';

export interface BalanceSheetHeaderProps {
    showStatus: boolean;
    isBalanced: boolean;
    onRefresh: () => void;
}

export default function BalanceSheetHeader({ showStatus, isBalanced, onRefresh }: BalanceSheetHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale className="w-6 h-6 text-violet-600" /> Balance Sheet
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Snapshot of Assets, Liabilities, and Equity at this point in time.
                </p>
            </div>
            <div className="flex items-center gap-3">
                {showStatus && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${isBalanced ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                        {isBalanced ? (
                            <><CheckCircle2 className="w-3 h-3" /> Balanced</>
                        ) : (
                            <><AlertCircle className="w-3 h-3" /> Out of Balance</>
                        )}
                    </div>
                )}
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>
        </div>
    );
}
