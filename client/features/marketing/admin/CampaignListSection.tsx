'use client';

import CampaignEmptyState from './CampaignEmptyState';
import CampaignList from './CampaignList';
import type { CampaignListSectionProps } from './types';

export default function CampaignListSection({
    campaigns,
    loading,
    hasAny,
    onCreate,
    onEdit,
    onSchedule,
    onCancel,
    onDelete,
    onView,
}: CampaignListSectionProps) {
    const showInitialLoader = loading && !hasAny;

    return (
        <div className="min-h-[400px]">
            {showInitialLoader ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing your campaigns...</p>
                </div>
            ) : campaigns.length > 0 ? (
                <CampaignList
                    campaigns={campaigns}
                    onEdit={onEdit}
                    onSchedule={onSchedule}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    onView={onView}
                />
            ) : (
                <CampaignEmptyState onCreate={onCreate} />
            )}
        </div>
    );
}
