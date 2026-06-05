import type { Campaign } from '../types';

export interface CampaignStat {
    label: string;
    value: number;
}

export interface CampaignHeaderProps {
    onCreate: () => void;
}

export interface CampaignStatsGridProps {
    stats: CampaignStat[];
}

export interface CampaignFilterBarProps {
    searchQuery: string;
    loading: boolean;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
}

export interface CampaignEmptyStateProps {
    onCreate: () => void;
}

export interface CampaignListSectionProps {
    campaigns: Campaign[];
    loading: boolean;
    hasAny: boolean;
    onCreate: () => void;
    onEdit: (campaign: Campaign) => void;
    onSchedule: (campaign: Campaign) => void;
    onCancel: (campaign: Campaign) => void;
    onDelete: (id: string) => void;
    onView: (campaign: Campaign) => void;
}
