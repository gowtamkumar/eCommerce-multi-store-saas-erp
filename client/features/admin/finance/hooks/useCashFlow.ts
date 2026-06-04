'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCashFlow } from '@/services/accounting';
import type { CashFlowReport } from '../types';

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function useCashFlow() {
    const [report, setReport] = useState<CashFlowReport | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCashFlow();
            setReport(res?.data || null);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load Cash Flow Statement'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchReport();
    }, [fetchReport]);

    return {
        report,
        loading,
        fetchReport,
    };
}
