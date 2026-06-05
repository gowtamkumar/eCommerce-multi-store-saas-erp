'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { FinanceDashboardData } from '../types';

export function useFinanceSummary() {
    const [data, setData] = useState<FinanceDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI('/report/finance-summary');
            setData(res?.data || null);
        } catch (error) {
            console.error('Error loading finance summary:', error);
            toast.error('Failed to load finance dashboard');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    return {
        data,
        isLoading,
        refresh: loadData,
    };
}
