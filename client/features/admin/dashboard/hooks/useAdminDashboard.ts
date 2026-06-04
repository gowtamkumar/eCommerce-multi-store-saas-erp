'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DashboardPeriod, DashboardStats } from '../types';

export function useAdminDashboard() {
    const [period, setPeriod] = useState<DashboardPeriod>('month');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const requestIdRef = useRef(0);

    const fetchDashboardStats = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        try {
            setLoading(true);
            setError(null);
            const response = await fetchAPI(`/report/dashboard?period=${period}`);

            if (requestId !== requestIdRef.current) return;

            if (response.success && response.data) {
                setStats(response.data);
                setLastUpdated(new Date());
            } else {
                setError('Unable to load dashboard data.');
            }
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            console.error('Failed to fetch dashboard stats', err);
            setError('Failed to load dashboard. Please try again.');
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [period]);

    useEffect(() => {
        const t = setTimeout(() => {
            void fetchDashboardStats();
        }, 0);
        return () => clearTimeout(t);
    }, [fetchDashboardStats]);

    return {
        period,
        setPeriod,
        stats,
        loading,
        error,
        lastUpdated,
        fetchDashboardStats,
    };
}
