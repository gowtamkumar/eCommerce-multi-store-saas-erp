'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBalanceSheet } from '@/services/accounting';
import toast from 'react-hot-toast';
import type { BalanceSheetData } from '../types';

/** @deprecated Use BalanceSheetData from ../types instead. */
export type BSData = BalanceSheetData;

export function useBalanceSheet() {
    const [data, setData] = useState<BalanceSheetData | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getBalanceSheet();
            setData(res?.data || null);
        } catch {
            toast.error("Failed to load Balance Sheet");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const isBalanced = data ? Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01 : false;

    return {
        data,
        loading,
        load,
        isBalanced,
    };
}
