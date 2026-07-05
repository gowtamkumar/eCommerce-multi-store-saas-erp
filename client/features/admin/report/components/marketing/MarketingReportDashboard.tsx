'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useMarketingReport } from '../../hooks/useMarketingReport';
import CampaignPerformancePanel from './CampaignPerformancePanel';
import CouponRedemptionPanel from './CouponRedemptionPanel';
import DiscountAnalysisPanel from './DiscountAnalysisPanel';
import LoyaltyLeaderboard from './LoyaltyLeaderboard';
import LoyaltyRulesCard from './LoyaltyRulesCard';
import MarketingKpiGrid from './MarketingKpiGrid';
import MarketingReportHeader from './MarketingReportHeader';

export default function MarketingReportDashboard() {
    const { formatPrice } = useSettings();
    const marketing = useMarketingReport();

    return (
        <div className="space-y-6">
            <MarketingReportHeader
                loading={marketing.loading}
                canExport={marketing.canExport}
                onRefresh={marketing.loadMarketingData}
                onExport={marketing.exportCsv}
            />

            <DiscountAnalysisPanel discounts={marketing.financialDiscounts} formatPrice={formatPrice} />

            <MarketingKpiGrid metrics={marketing.metrics} subscribersCount={marketing.subscribersCount} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <LoyaltyRulesCard
                    config={marketing.loyaltyConfig}
                    rules={marketing.loyaltyRules}
                    formatPrice={formatPrice}
                />
                <LoyaltyLeaderboard customers={marketing.topLoyalCustomers} loading={marketing.loading} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <CampaignPerformancePanel
                    campaigns={marketing.filteredCampaigns}
                    loading={marketing.loading}
                    search={marketing.campaignSearch}
                    onSearchChange={marketing.setCampaignSearch}
                />
                <CouponRedemptionPanel
                    coupons={marketing.filteredCoupons}
                    loading={marketing.loading}
                    search={marketing.couponSearch}
                    onSearchChange={marketing.setCouponSearch}
                    formatPrice={formatPrice}
                />
            </div>
        </div>
    );
}
