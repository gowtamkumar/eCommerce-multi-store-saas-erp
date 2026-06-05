'use client';

import { Activity, Coins, Megaphone, Users } from 'lucide-react';
import type { MarketingMetrics } from '../../types';
import MarketingMetricCard from './MarketingMetricCard';

export interface MarketingKpiGridProps {
    metrics: MarketingMetrics;
    subscribersCount: number;
}

export default function MarketingKpiGrid({ metrics, subscribersCount }: MarketingKpiGridProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MarketingMetricCard
                title="Newsletter Audience"
                value={subscribersCount}
                subtext="Total active subscribers"
                icon={Users}
                colorClass="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
            />
            <MarketingMetricCard
                title="Campaign Dispatch"
                value={metrics.totalCampaigns}
                subtext={`${metrics.totalReach} total reach`}
                icon={Megaphone}
                colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            />
            <MarketingMetricCard
                title="Campaign Delivery"
                value={`${metrics.deliverySuccessRate.toFixed(1)}%`}
                subtext="Average delivery rate"
                icon={Activity}
                colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
            />
            <MarketingMetricCard
                title="Loyalty Points Balance"
                value={metrics.totalPointsHeld}
                subtext={`${metrics.totalRedemptions} redemptions`}
                icon={Coins}
                colorClass="bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400"
            />
        </div>
    );
}
