'use client';

import { BookOpen, Plus, RefreshCw } from 'lucide-react';

export interface LedgerHeaderProps {
    showPostButton: boolean;
    refreshing: boolean;
    onPost: () => void;
    onRefresh: () => void;
}

export default function LedgerHeader({ showPostButton, refreshing, onPost, onRefresh }: LedgerHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <BookOpen className="w-8 h-8 text-indigo-600" /> General Ledger Audit
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                    Dual inventory movements ledger and immutable double-entry financial journals
                </p>
            </div>
            <div className="flex items-center gap-2">
                {showPostButton && (
                    <button
                        onClick={onPost}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Post Entry
                    </button>
                )}
                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>
        </div>
    );
}
