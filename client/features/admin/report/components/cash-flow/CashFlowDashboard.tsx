'use client';

import { useSettings } from '@/hooks/SettingsContext';
import React from 'react';
import { useCashFlowReport } from '../../hooks/useCashFlowReport';
import CashFlowChart from './CashFlowChart';
import CashFlowHeader from './CashFlowHeader';
import CashFlowKpiGrid from './CashFlowKpiGrid';
import CashFlowMovementTable from './CashFlowMovementTable';

const CashFlowDashboard: React.FC = () => {
    const { formatPrice } = useSettings();
    const { data, isLoading, isExporting, handleExport } = useCashFlowReport();

    if (isLoading && !data) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <CashFlowHeader onExport={handleExport} isExporting={isExporting} />

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
