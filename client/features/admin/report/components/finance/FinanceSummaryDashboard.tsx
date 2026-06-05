'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useFinanceSummary } from '../../hooks/useFinanceSummary';
import FinanceKpiGrid from './FinanceKpiGrid';
import FinanceQuickActions from './FinanceQuickActions';
import FinanceSummaryHeader from './FinanceSummaryHeader';
import FinanceSupplyChainCard from './FinanceSupplyChainCard';
import OutflowPieChart from './OutflowPieChart';
import RevenuePayoutChart from './RevenuePayoutChart';

export default function FinanceSummaryDashboard() {
    const { formatPrice } = useSettings();
    const { data, isLoading, refresh } = useFinanceSummary();

    return (
        <div className="space-y-8">
            <FinanceSummaryHeader onRefresh={refresh} isLoading={isLoading} />

            <FinanceKpiGrid
                kpis={data?.kpis}
                isLoading={isLoading}
                formatPrice={formatPrice}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <RevenuePayoutChart
                        chartData={data?.chartData || []}
                        isLoading={isLoading}
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
                    />
                </div>
            </div>

            <FinanceQuickActions />
        </div>
    );
}
