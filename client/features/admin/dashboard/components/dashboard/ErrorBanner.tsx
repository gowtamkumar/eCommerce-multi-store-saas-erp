'use client';

import { AlertTriangle } from 'lucide-react';

export default function ErrorBanner({
    error,
    onRetry,
}: {
    error: string | null;
    onRetry: () => void;
}) {
    if (!error) return null;

    return (
        <div className="flex items-center justify-between gap-4 p-5 rounded-3xl bg-rose-50 dark:bg-rose-900/15 border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
            </div>
            <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest transition-all"
            >
                Retry
            </button>
        </div>
    );
}
