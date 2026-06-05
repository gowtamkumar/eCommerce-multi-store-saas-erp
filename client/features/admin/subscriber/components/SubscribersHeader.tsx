'use client';

import { Download, Loader2, Mail } from 'lucide-react';
import type { SubscribersHeaderProps } from '../type';

export default function SubscribersHeader({ onExport, exporting }: SubscribersHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-linear-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
                    <Mail className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">Neural Subscribers</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your boutique&apos;s newsletter network cluster.</p>
                </div>
            </div>
            <button
                onClick={onExport}
                disabled={exporting}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-none font-bold text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export Dataset
            </button>
        </div>
    );
}
