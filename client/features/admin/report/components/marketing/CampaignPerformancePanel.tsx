'use client';

import { useMemo } from 'react';
import { Megaphone, Search } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import type { MarketingCampaign } from '../../types';
import { buildCampaignColumns } from './marketingColumns';

export interface CampaignPerformancePanelProps {
    campaigns: MarketingCampaign[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
}

export default function CampaignPerformancePanel({
    campaigns,
    loading,
    search,
    onSearchChange,
}: CampaignPerformancePanelProps) {
    const columns = useMemo(() => buildCampaignColumns(), []);

    return (
        <div className="xl:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-blue-500" />
                            Messaging Campaigns Performance
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Performance tracking of email, SMS, and push notification dispatches</p>
                    </div>
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search campaign name..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>
                </div>

                <DataTable
                    data={campaigns}
                    columns={columns}
                    getRowKey={(c) => c.id || c.name}
                    loading={loading}
                    emptyLabel="No campaign data found"
                    minWidthClassName="min-w-[700px]"
                    containerClassName="!bg-transparent !shadow-none !border-none !rounded-none !p-0"
                />
            </div>
        </div>
    );
}
