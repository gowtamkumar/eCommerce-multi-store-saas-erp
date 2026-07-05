'use client';

import { useMemo } from 'react';
import { useSettings } from '@/hooks/SettingsContext';
import { useFinanceSummary } from '../../hooks/useFinanceSummary';
import { buildFinanceSummaryReportSummary } from '../../lib/buildReportExecutiveSummaryContext';
import FinanceKpiGrid from './FinanceKpiGrid';
import FinanceQuickActions from './FinanceQuickActions';
import FinanceSummaryHeader from './FinanceSummaryHeader';
import FinanceSupplyChainCard from './FinanceSupplyChainCard';
import OutflowPieChart from './OutflowPieChart';
import RevenuePayoutChart from './RevenuePayoutChart';
import ReportExecutiveSummaryPanel from '../ReportExecutiveSummaryPanel';

export default function FinanceSummaryDashboard() {
    const { formatPrice, selectedCurrency } = useSettings();
    const { data, isLoading, refresh } = useFinanceSummary();
    const reportSummary = useMemo(() => buildFinanceSummaryReportSummary(data), [data]);

    return (
        <div className="space-y-8">
            <FinanceSummaryHeader
                onRefresh={refresh}
                isLoading={isLoading}
                currencyCode={selectedCurrency.code}
                currencySymbol={selectedCurrency.symbol}
            />

            <FinanceKpiGrid
                kpis={data?.kpis}
                isLoading={isLoading}
                formatPrice={formatPrice}
            />

            <ReportExecutiveSummaryPanel
                reportType="finance-summary"
                reportSummary={reportSummary}
                disabled={isLoading || !data}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <RevenuePayoutChart
                        chartData={data?.chartData || []}
                        isLoading={isLoading}
                        formatPrice={formatPrice}
                        currencySymbol={selectedCurrency.symbol}
                    />
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6">
                    <FinanceSupplyChainCard
                        stats={data?.supplierStats}
                        payoutsDue={data?.kpis?.totalAmountDue || 0}
                        isLoading={isLoading}
                        formatPrice={formatPrice}
                    />

                    <OutflowPieChart
                        data={data?.expenseBreakdown || []}
                        isLoading={isLoading}
                        formatPrice={formatPrice}
                    />
                </div>
            </div>

            <FinanceQuickActions />
        </div>
    );
}
