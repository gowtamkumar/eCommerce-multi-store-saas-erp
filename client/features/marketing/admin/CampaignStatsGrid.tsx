'use client';

import type { CampaignStatsGridProps } from './types';

export default function CampaignStatsGrid({ stats }: CampaignStatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                </div>
            ))}
        </div>
    );
}
