import { CampaignType } from '@/features/marketing/types/index';
import { fetchAPI } from './api';

export const fetchCampaigns = async () => {
    return fetchAPI('/campaigns');
};

export const fetchCampaignById = async (id: string) => {
    return fetchAPI(`/campaigns/${id}`);
};

export const createCampaign = async (data: {
    name: string;
    type: CampaignType;
    subject?: string;
    htmlContent?: string;
    text?: string;
    title?: string;
    body?: string;
    imageUrl?: string;
    scheduleTime?: string | Date | null;
    targetUsers?: boolean;
    targetSubscribers?: boolean;
    targetLeads?: boolean;
}) => {
    return fetchAPI('/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const scheduleCampaign = async (id: string, scheduleTime: string) => {
    return fetchAPI(`/campaigns/${id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ scheduleTime }),
    });
};

export const cancelCampaignSchedule = async (id: string) => {
    return fetchAPI(`/campaigns/${id}/cancel`, {
        method: 'POST',
    });
};

export const updateCampaign = async (id: string, data: Partial<Parameters<typeof createCampaign>[0]>) => {
    return fetchAPI(`/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const deleteCampaign = async (id: string) => {
    return fetchAPI(`/campaigns/${id}`, {
        method: 'DELETE',
    });
};

export const fetchCampaignLogs = async (id: string, page: number = 1, limit: number = 10) => {
    return fetchAPI(`/campaigns/${id}/logs?page=${page}&limit=${limit}`);
};

export interface CampaignKpis {
    campaignId: string;
    totalAudience: number;
    sent: number;
    failed: number;
    opened: number;
    clicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
}

export const fetchCampaignKpis = async (id: string): Promise<CampaignKpis | null> => {
    const res = await fetchAPI(`/campaigns/${id}/kpis`);
    return res?.success ? res.data : null;
};
