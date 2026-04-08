'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import toast from 'react-hot-toast';
import { CashFlowData } from '../types';
import CashFlowHeader from './CashFlowHeader';
import CashFlowKpiGrid from './CashFlowKpiGrid';
import CashFlowChart from './CashFlowChart';
import CashFlowMovementTable from './CashFlowMovementTable';

const CashFlowDashboard: React.FC = () => {
    const { formatPrice } = useSettings();
    const [data, setData] = useState<CashFlowData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI('/report/cash-flow');
            setData(res.data);
        } catch (error) {
            console.error('Cash Flow fetch error:', error);
            toast.error('Failed to load cash flow summary');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleExport = useCallback(() => {
        window.print();
    }, []);

    if (isLoading && !data) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <CashFlowHeader onExport={handleExport} />

            <CashFlowKpiGrid
                summary={data.summary}
                formatPrice={formatPrice}
            />

            <CashFlowChart chartData={data.chartData} />

            <CashFlowMovementTable
                movements={data.recentMovements}
                formatPrice={formatPrice}
            />
        </div>
    );
};

export default CashFlowDashboard;
