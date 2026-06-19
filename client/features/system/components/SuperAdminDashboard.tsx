'use client';

import { useSuperAdminDashboard } from '../hooks/useSuperAdminDashboard';
import type { SuperAdminDashboardProps } from '../types/dashboard.types';
import DashboardHeader from './dashboard/DashboardHeader';
import ActionCenter from './dashboard/ActionCenter';
import KpiCards from './dashboard/KpiCards';
import FinanceSnapshot from './dashboard/FinanceSnapshot';
import PlanDistribution from './dashboard/PlanDistribution';
import PlatformTrafficChart from './dashboard/PlatformTrafficChart';
import TopStoresTable from './dashboard/TopStoresTable';
import { TenantHealthAiPanel } from './dashboard/TenantHealthAiPanel';
import { PlatformSupportAiPanel } from './dashboard/PlatformSupportAiPanel';

export default function SuperAdminDashboard({
  stats: initialStats,
  traffic: initialTraffic,
  tenantAnalytics: initialAnalytics,
}: SuperAdminDashboardProps) {
  const {
    days,
    setDays,
    stats,
    traffic,
    analytics,
    billing,
    isRefreshing,
    isExporting,
    lastRefreshed,
    refresh,
    exportCsv,
  } = useSuperAdminDashboard({ initialStats, initialTraffic, initialAnalytics });

  return (
    <div className="space-y-8">
      <DashboardHeader
        totalTenants={stats.totalTenants}
        lastRefreshed={lastRefreshed}
        days={days}
        onDaysChange={setDays}
        onRefresh={() => refresh(days)}
        onExport={exportCsv}
        isRefreshing={isRefreshing}
        isExporting={isExporting}
      />

      <ActionCenter stats={stats} billing={billing} />

      <TenantHealthAiPanel days={days} />

      <PlatformSupportAiPanel />

      <KpiCards stats={stats} isRefreshing={isRefreshing} />

      <FinanceSnapshot billing={billing} isRefreshing={isRefreshing} />

      <div className="grid lg:grid-cols-3 gap-8">
        <PlanDistribution stats={stats} />
        <PlatformTrafficChart traffic={traffic} days={days} trafficTrend={stats.trends?.traffic} />
      </div>

      <TopStoresTable analytics={analytics} />
    </div>
  );
}
