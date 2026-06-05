'use client';

import { fetchAPI } from '@/services/api';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { ProfitLossData, SalesReportDateRange } from '../types';

export function useProfitLossReport() {
    const [data, setData] = useState<ProfitLossData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<SalesReportDateRange>({
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });

    const fetchReport = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            });
            const res = await fetchAPI(`/report/profit-loss?${params.toString()}`);
            setData(res?.data || null);
        } catch (error) {
            console.error('Error loading P&L report:', error);
            toast.error('Failed to load P&L report');
        } finally {
            setIsLoading(false);
        }
    }, [dateRange.startDate, dateRange.endDate]);

    useEffect(() => {
        void fetchReport();
    }, [fetchReport]);

    const handleDateChange = useCallback((key: 'startDate' | 'endDate', value: string) => {
        setDateRange((prev) => ({ ...prev, [key]: value }));
    }, []);

    return {
        data,
        isLoading,
        dateRange,
        handleDateChange,
        fetchReport,
    };
}
