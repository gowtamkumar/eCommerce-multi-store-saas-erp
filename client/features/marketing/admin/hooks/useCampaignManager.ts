'use client';

import {
    cancelCampaignSchedule,
    deleteCampaign,
    fetchCampaigns,
    scheduleCampaign,
} from '@/services/campaign';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { Campaign } from '../../types';
import { buildCampaignStats, filterCampaignsByName } from '../lib/campaignStats';

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function useCampaignManager() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);

    const loadCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchCampaigns();
            if (res.success) {
                setCampaigns(res.data || []);
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load campaigns'));
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

    const openEdit = useCallback((campaign: Campaign) => {
        setEditingCampaign(campaign);
        setIsFormOpen(true);
    }, []);

    const closeForm = useCallback(() => setIsFormOpen(false), []);

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        void loadCampaigns();
    }, [loadCampaigns]);

    const openView = useCallback((campaign: Campaign) => setViewingCampaign(campaign), []);
    const closeView = useCallback(() => setViewingCampaign(null), []);

    const handleSchedule = useCallback(async (campaign: Campaign) => {
        if (!campaign.scheduleTime) {
            toast.error('Please set a schedule time first by editing the campaign');
            return;
        }
        try {
            const res = await scheduleCampaign(campaign.id, campaign.scheduleTime);
            if (res.success) {
                toast.success('Campaign scheduled successfully');
                void loadCampaigns();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to schedule'));
        }
    }, [loadCampaigns]);

    const handleCancel = useCallback(async (campaign: Campaign) => {
        try {
            const res = await cancelCampaignSchedule(campaign.id);
            if (res.success) {
                toast.success('Schedule canceled');
                void loadCampaigns();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to cancel'));
        }
    }, [loadCampaigns]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            const res = await deleteCampaign(id);
            if (res.success) {
                toast.success('Campaign deleted');
                void loadCampaigns();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete'));
        }
    }, [loadCampaigns]);

    const filteredCampaigns = useMemo(
        () => filterCampaignsByName(campaigns, searchQuery),
        [campaigns, searchQuery],
    );

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
