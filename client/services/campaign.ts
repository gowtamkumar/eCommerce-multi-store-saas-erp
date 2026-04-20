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
    scheduleTime?: string;
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
