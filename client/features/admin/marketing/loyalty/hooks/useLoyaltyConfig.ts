'use client';

import {
    getLoyaltyConfig,
    getLoyaltyLiability,
    updateLoyaltyConfig,
    type LoyaltyConfig,
    type LoyaltyLiability,
} from '@/services/loyalty';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage } from '../lib/loyalty';
import type { LoyaltyAlert } from '../types';

const EMPTY_MESSAGE: LoyaltyAlert = { text: '', type: '' };

export function useLoyaltyConfig() {
    const [config, setConfig] = useState<LoyaltyConfig | null>(null);
    const [liability, setLiability] = useState<LoyaltyLiability | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<LoyaltyAlert>(EMPTY_MESSAGE);

    const loadConfig = useCallback(async () => {
        setLoading(true);
        try {
            const [data, liabilityData] = await Promise.all([
                getLoyaltyConfig(),
                getLoyaltyLiability().catch(() => null),
            ]);
            setConfig(data);
            setLiability(liabilityData);
        } catch (error) {
            console.error(error);
            setMessage({ text: getErrorMessage(error, 'Failed to load loyalty settings'), type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadConfig();
    }, [loadConfig]);

    const updateConfig = useCallback((patch: Partial<LoyaltyConfig>) => {
        setConfig((prev) => (prev ? { ...prev, ...patch } : prev));
    }, []);

    const saveConfig = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        if (!config) return;

        setSaving(true);
        setMessage(EMPTY_MESSAGE);
        try {
            const updated = await updateLoyaltyConfig(config);
            setConfig(updated);
            setMessage({ text: 'Loyalty program settings updated successfully!', type: 'success' });
        } catch (error) {
            console.error(error);
            setMessage({ text: getErrorMessage(error, 'Failed to save settings'), type: 'error' });
        } finally {
            setSaving(false);
        }
    }, [config]);

    return {
        config,
        liability,
        loading,
        saving,
        message,
        loadConfig,
        updateConfig,
        saveConfig,
    };
}
