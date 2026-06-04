'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProfitAndLoss } from '@/services/accounting';
import toast from 'react-hot-toast';
import type { ProfitLossPreset } from '../types';

export type { AccountBreakdown, PLData } from '../types';
import type { PLData } from '../types';

export function useProfitLoss() {
    const [data, setData] = useState<PLData | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Detailed breakdown expansions
    const [expandRevenue, setExpandRevenue] = useState(false);
    const [expandCogs, setExpandCogs] = useState(false);
    const [expandExpenses, setExpandExpenses] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params: { startDate?: string; endDate?: string } = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await getProfitAndLoss(params);
            if (res.success) {
                setData(res.data || null);
            } else {
                toast.error(res.message || 'Failed to generate financial statement');
            }
        } catch {
            toast.error('Failed to connect to the reporting engine');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        void load();
    }, [startDate, endDate, load]);

    const setPresetRange = useCallback((preset: ProfitLossPreset) => {
        const now = new Date();
        let start = new Date();
        if (preset === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (preset === 'quarter') {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), currentQuarter * 3, 1);
        } else if (preset === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
        } else {
            setStartDate('');
            setEndDate('');
            return;
        }
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
    }, []);

    const grossMargin = data ? ((data.grossProfit / (data.revenue || 1)) * 100).toFixed(1) : "0.0";
    const netMargin = data ? ((data.netProfit / (data.revenue || 1)) * 100).toFixed(1) : "0.0";
    const isProfitable = (data?.netProfit || 0) >= 0;

    return {
        data,
        loading,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        expandRevenue,
        setExpandRevenue,
        expandCogs,
        setExpandCogs,
        expandExpenses,
        setExpandExpenses,
        load,
        setPresetRange,
        grossMargin,
        netMargin,
        isProfitable,
    };
}
