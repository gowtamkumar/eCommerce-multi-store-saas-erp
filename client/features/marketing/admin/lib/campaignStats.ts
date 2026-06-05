import { CampaignStatus, type Campaign } from '../../types';
import type { CampaignStat } from '../types';

export function buildCampaignStats(campaigns: Campaign[]): CampaignStat[] {
    return [
        { label: 'Total Campaigns', value: campaigns.length },
        { label: 'Active/Running', value: campaigns.filter((c) => c.status === CampaignStatus.RUNNING).length },
        { label: 'Total Sent', value: campaigns.reduce((acc, c) => acc + c.sentCount, 0) },
        { label: 'Total Failed', value: campaigns.reduce((acc, c) => acc + c.failedCount, 0) },
    ];
}

export function filterCampaignsByName(campaigns: Campaign[], searchQuery: string): Campaign[] {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return campaigns;
    return campaigns.filter((c) => c.name.toLowerCase().includes(query));
}
