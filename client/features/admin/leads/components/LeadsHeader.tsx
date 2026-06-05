'use client';

import { Download, Loader2, MessageSquare } from 'lucide-react';
import type { LeadsHeaderProps } from '../type';

export default function LeadsHeader({ onExport, exporting }: LeadsHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                    <MessageSquare className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Newsletter</h1>
                    <p className="text-slate-500 dark:text-slate-400">View newsletter subscribers</p>
                </div>
            </div>
            <button
                onClick={onExport}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                <span className="hidden sm:inline">Export CSV</span>
            </button>
        </div>
    );
}
