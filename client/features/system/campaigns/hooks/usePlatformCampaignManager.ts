'use client';

import {
    cancelPlatformCampaignSchedule,
    deletePlatformCampaign,
    fetchPlatformCampaigns,
    schedulePlatformCampaign,
    PlatformCampaign,
} from '@/services/superAdminCampaign';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function buildCampaignStats(campaigns: PlatformCampaign[]) {
    return [
        { label: 'Total Campaigns', value: campaigns.length },
        { label: 'Active/Running', value: campaigns.filter((c) => c.status === 'RUNNING').length },
        { label: 'Total Sent', value: campaigns.reduce((acc, c) => acc + c.sentCount, 0) },
        { label: 'Total Failed', value: campaigns.reduce((acc, c) => acc + c.failedCount, 0) },
    ];
}

export function usePlatformCampaignManager() {
    const [campaigns, setCampaigns] = useState<PlatformCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<PlatformCampaign | null>(null);
    const [viewingCampaign, setViewingCampaign] = useState<PlatformCampaign | null>(null);

    const loadCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchPlatformCampaigns();
            setCampaigns(data || []);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load platform campaigns'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCampaigns();
    }, [loadCampaigns]);

    const openCreate = useCallback(() => {
        setEditingCampaign(null);
        setIsFormOpen(true);
    }, []);

    const openEdit = useCallback((campaign: PlatformCampaign) => {
        setEditingCampaign(campaign);
        setIsFormOpen(true);
    }, []);

    const closeForm = useCallback(() => setIsFormOpen(false), []);

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        void loadCampaigns();
    }, [loadCampaigns]);

    const openView = useCallback((campaign: PlatformCampaign) => setViewingCampaign(campaign), []);
    const closeView = useCallback(() => setViewingCampaign(null), []);

    const handleSchedule = useCallback(async (campaign: PlatformCampaign) => {
        if (!campaign.scheduleTime) {
            toast.error('Please set a schedule time first by editing the campaign');
            return;
        }
        try {
            const res = await schedulePlatformCampaign(campaign.id, campaign.scheduleTime);
            if (res.success) {
                toast.success('Platform campaign scheduled successfully');
                void loadCampaigns();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to schedule platform campaign'));
        }
    }, [loadCampaigns]);

    const handleCancel = useCallback(async (campaign: PlatformCampaign) => {
        try {
            const res = await cancelPlatformCampaignSchedule(campaign.id);
            if (res.success) {
                toast.success('Platform campaign schedule canceled');
                void loadCampaigns();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to cancel schedule'));
        }
    }, [loadCampaigns]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            const res = await deletePlatformCampaign(id);
            if (res.success) {
                toast.success('Platform campaign deleted');
                void loadCampaigns();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete platform campaign'));
        }
    }, [loadCampaigns]);

    const filteredCampaigns = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return campaigns;
        return campaigns.filter((c) => c.name.toLowerCase().includes(query));
    }, [campaigns, searchQuery]);

    const stats = useMemo(() => buildCampaignStats(campaigns), [campaigns]);

    return {
        campaigns,
        filteredCampaigns,
        stats,
        loading,
        searchQuery,
        isFormOpen,
        editingCampaign,
        viewingCampaign,
        setSearchQuery,
        loadCampaigns,
        openCreate,
        openEdit,
        closeForm,
        handleFormSuccess,
        openView,
        closeView,
        handleSchedule,
        handleCancel,
        handleDelete,
    };
}
