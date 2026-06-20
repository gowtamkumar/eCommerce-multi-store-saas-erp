import { fetchSuperAdminAPI } from './superAdminApi';

export type CampaignType = 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface PlatformCampaign {
    id: string;
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    scheduleTime: string | null;
    totalAudience: number;
    sentCount: number;
    failedCount: number;
    targetTenants: boolean;
    targetSubscribers: boolean;
    targetUsers: boolean;
    createdAt: string;
    updatedAt: string;
}

export const fetchPlatformCampaigns = async (): Promise<PlatformCampaign[]> => {
    const res = await fetchSuperAdminAPI('/super-admin/campaigns');
    return res?.success ? res.data : [];
};

export const fetchPlatformCampaignById = async (id: string): Promise<PlatformCampaign | null> => {
    const res = await fetchSuperAdminAPI(`/super-admin/campaigns/${id}`);
    return res?.success ? res.data : null;
};

export const createPlatformCampaign = async (data: {
    name: string;
    type: CampaignType;
    subject?: string;
    htmlContent?: string;
    text?: string;
    title?: string;
    body?: string;
    imageUrl?: string;
    scheduleTime?: string | Date | null;
    targetTenants?: boolean;
    targetSubscribers?: boolean;
    targetUsers?: boolean;
}) => {
    return fetchSuperAdminAPI('/super-admin/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const schedulePlatformCampaign = async (id: string, scheduleTime: string) => {
    return fetchSuperAdminAPI(`/super-admin/campaigns/${id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ scheduleTime }),
    });
};

export const cancelPlatformCampaignSchedule = async (id: string) => {
    return fetchSuperAdminAPI(`/super-admin/campaigns/${id}/cancel`, {
        method: 'POST',
    });
};

export const updatePlatformCampaign = async (id: string, data: Partial<Parameters<typeof createPlatformCampaign>[0]>) => {
    return fetchSuperAdminAPI(`/super-admin/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const deletePlatformCampaign = async (id: string) => {
    return fetchSuperAdminAPI(`/super-admin/campaigns/${id}`, {
        method: 'DELETE',
    });
};

export const fetchPlatformCampaignLogs = async (id: string, page: number = 1, limit: number = 10) => {
    const res = await fetchSuperAdminAPI(`/super-admin/campaigns/${id}/logs?page=${page}&limit=${limit}`);
    return res?.success ? res.data : { data: [], total: 0 };
};

export interface PlatformCampaignKpis {
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

export const fetchPlatformCampaignKpis = async (id: string): Promise<PlatformCampaignKpis | null> => {
    const res = await fetchSuperAdminAPI(`/super-admin/campaigns/${id}/kpis`);
    return res?.success ? res.data : null;
};
