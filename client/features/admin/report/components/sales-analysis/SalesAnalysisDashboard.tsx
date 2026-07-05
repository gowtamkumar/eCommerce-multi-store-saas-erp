'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useSalesAnalysis } from '../../hooks/useSalesAnalysis';
import SalesAnalysisHeader from './SalesAnalysisHeader';
import SalesStatsGrid from './SalesStatsGrid';
import SalesTablesSection from './SalesTablesSection';
import SalesTrendChart from './SalesTrendChart';

export default function SalesAnalysisDashboard() {
    const { formatPrice, selectedCurrency } = useSettings();
    const {
        data,
        isLoading,
        period,
        isExporting,
        setPeriod,
        exportSalesReport,
    } = useSalesAnalysis();

    return (
        <div className="space-y-6">
            <SalesAnalysisHeader
                period={period}
                isExporting={isExporting}
                onPeriodChange={setPeriod}
                onExport={exportSalesReport}
                currencyCode={selectedCurrency.code}
                currencySymbol={selectedCurrency.symbol}
            />
            <SalesStatsGrid
                data={data}
                isLoading={isLoading}
                formatPrice={formatPrice}
            />
            <SalesTrendChart
                salesData={data?.salesData || []}
                isLoading={isLoading}
                formatPrice={formatPrice}
                currencySymbol={selectedCurrency.symbol}
            />
            <SalesTablesSection
                lowStockProducts={data?.lowStockProducts || []}
                recentProducts={data?.recentProducts || []}
                isLoading={isLoading}
            />
        </div>
    );
}
