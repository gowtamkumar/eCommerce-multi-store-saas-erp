'use client';

import { motion } from 'framer-motion';
import { Megaphone, Plus } from 'lucide-react';
import type { CampaignHeaderProps } from './types';

export default function CampaignHeader({ onCreate }: CampaignHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-4">
                    <Megaphone className="w-10 h-10 text-brand-600" />
                    Marketing Campaigns
                </h1>
                <p className="text-slate-500 font-medium mt-1">Design, schedule and track your customer engagement</p>
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreate}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-500/20"
            >
                <Plus className="w-5 h-5" />
                New Campaign
            </motion.button>
        </div>
    );
}
