'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { SalesDashboardData, SalesReportDateRange, SalesReportPeriod } from '../types';
import { useReportExport } from './useReportExport';

function computePeriodRange(period: SalesReportPeriod): SalesReportDateRange {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    const start = new Date(now);

    switch (period) {
        case 'day':
            return { startDate: end, endDate: end };
        case 'week':
            start.setDate(start.getDate() - 6);
            return { startDate: start.toISOString().split('T')[0], endDate: end };
        case 'month':
        default:
            return {
                startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
                endDate: end,
            };
    }
}

export function useSalesAnalysis() {
    const [data, setData] = useState<SalesDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<SalesReportPeriod>('month');
    const { exportReport, isExporting } = useReportExport();

    const fetchReport = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({ period });
            const res = await fetchAPI(`/report/dashboard?${params.toString()}`);
            if (res && res.data) {
                setData(res.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard report:', error);
            toast.error('Failed to load sales report');
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useEffect(() => {
        void fetchReport();
    }, [fetchReport]);

    const dateRange = useMemo(() => computePeriodRange(period), [period]);

    const exportSalesReport = useCallback(() => {
        void exportReport({ type: 'sales', ...dateRange });
    }, [exportReport, dateRange]);

    return {
        data,
        isLoading,
        period,
        isExporting,
        setPeriod,
        fetchReport,
        exportSalesReport,
    };
}
