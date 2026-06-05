import { Suspense } from "react";
import SuperAdminDashboard from "@/features/system/components/SuperAdminDashboard";
import { fetchSuperAdminAPI } from "@/services/superAdminApi";
import { buildDashboardStats } from "@/features/system/lib/dashboard";
import type { TenantAnalytics } from "@/features/system/types/dashboard.types";

async function getSuperAdminDashboardData() {
  try {
    const [overview, analyticsRes] = await Promise.all([
      fetchSuperAdminAPI('/super-admin/overview?days=7'),
      fetchSuperAdminAPI('/super-admin/tenants/analytics')
    ]);

    const tenants: TenantAnalytics[] = analyticsRes.data || [];

    return {
      stats: buildDashboardStats(overview.data, tenants),
      traffic: overview.data?.traffic || [],
      tenantAnalytics: tenants
    };
  } catch (error) {
    console.error("Error fetching super admin dashboard data:", error);
    return {
      stats: buildDashboardStats(undefined, []),
      traffic: [],
      tenantAnalytics: []
    };
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg mt-2" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-10 w-32 bg-indigo-200 dark:bg-indigo-900 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 h-28" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl h-80 border border-slate-100 dark:border-slate-700" />
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl h-80 border border-slate-100 dark:border-slate-700" />
      </div>
    </div>
  );
}

async function DashboardContent() {
  const data = await getSuperAdminDashboardData();
  return (
    <SuperAdminDashboard
      stats={data.stats}
      traffic={data.traffic}
      tenantAnalytics={data.tenantAnalytics}
    />
  );
}

export default function SuperAdminOverviewPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
