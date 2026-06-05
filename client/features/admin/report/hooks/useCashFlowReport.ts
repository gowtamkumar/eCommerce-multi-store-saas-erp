'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { CashFlowData } from '../types';
import { useReportExport } from './useReportExport';

export function useCashFlowReport() {
    const [data, setData] = useState<CashFlowData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { exportReport, isExporting } = useReportExport();

    const fetchReport = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI('/report/cash-flow');
            setData(res?.data || null);
        } catch (error) {
            console.error('Cash Flow fetch error:', error);
            toast.error('Failed to load cash flow summary');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchReport();
    }, [fetchReport]);

    const handleExport = useCallback(() => {
        void exportReport({ type: 'cash-flow' });
    }, [exportReport]);

    return {
        data,
        isLoading,
        isExporting,
        handleExport,
    };
}
