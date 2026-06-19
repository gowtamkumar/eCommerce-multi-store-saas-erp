'use client';

import { useMemo } from 'react';
import { useSettings } from '@/hooks/SettingsContext';
import { useProfitLossReport } from '../../hooks/useProfitLossReport';
import { buildProfitLossReportSummary } from '../../lib/buildReportExecutiveSummaryContext';
import ExpenseDistribution from '../expense/ExpenseDistribution';
import FinancialStatement from '../finance/FinancialStatement';
import ReportExecutiveSummaryPanel from '../ReportExecutiveSummaryPanel';
import ProfitLossKpiGrid from './ProfitLossKpiGrid';
import ProfitLossHeader from './ProfitLossHeader';

export default function ProfitLossDashboard() {
    const { formatPrice } = useSettings();
    const { data, isLoading, dateRange, handleDateChange, fetchReport } = useProfitLossReport();
    const reportSummary = useMemo(() => buildProfitLossReportSummary(data), [data]);

    return (
        <div className="space-y-6">
            <ProfitLossHeader
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDateChange={handleDateChange}
                onFilter={fetchReport}
            />

            <ProfitLossKpiGrid
                data={data}
                isLoading={isLoading}
                formatPrice={formatPrice}
            />

            <ReportExecutiveSummaryPanel
                reportType="profit-loss"
                reportSummary={reportSummary}
                disabled={isLoading || !data}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <FinancialStatement
                        data={data}
                        isLoading={isLoading}
                        formatPrice={formatPrice}
                    />
                </div>
                <div className="lg:col-span-1">
                    <ExpenseDistribution
                        data={data?.operatingExpenses}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
