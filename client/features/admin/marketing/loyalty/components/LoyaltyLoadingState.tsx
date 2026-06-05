'use client';

import { RefreshCw } from 'lucide-react';

interface LoyaltyLoadingStateProps {
    label: string;
}

export default function LoyaltyLoadingState({ label }: LoyaltyLoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-widest animate-pulse">{label}</p>
        </div>
    );
}
