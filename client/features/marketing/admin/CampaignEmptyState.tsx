'use client';

import { Megaphone } from 'lucide-react';
import type { CampaignEmptyStateProps } from './types';

export default function CampaignEmptyState({ onCreate }: CampaignEmptyStateProps) {
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                <Megaphone className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Campaigns Found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-8">Start growing your store today by creating your first marketing campaign.</p>
            <button
                onClick={onCreate}
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs"
            >
                Get Started
            </button>
        </div>
    );
}
