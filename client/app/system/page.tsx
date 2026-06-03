import { Suspense } from "react";
import SuperAdminDashboard from "@/features/system/components/SuperAdminDashboard";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";

async function getSuperAdminDashboardData() {
  try {
    const [overview, analyticsRes] = await Promise.all([
      fetchSuperAdminAPI('/super-admin/overview?days=7'),
      fetchSuperAdminAPI('/super-admin/tenants/analytics')
    ]);

    const tenants = analyticsRes.data || [];
    const plans = tenants.reduce((acc: Record<string, number>, t: any) => {
      const plan = t.subscriptionPlan?.name?.toLowerCase() || 'basic';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});

    const statuses = tenants.reduce((acc: Record<string, number>, t: any) => {
      const status = t.status?.toLowerCase() || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      stats: {
        totalTenants: overview.data?.totalTenants || 0,
        totalUsers: overview.data?.totalUsers || 0,
        totalOrders: overview.data?.totalOrders || 0,
        totalReviews: overview.data?.totalReviews || 0,
        requestsLast24h: overview.data?.totalRequestsLast24h || 0,
        plans,
        statuses,
        trends: overview.data?.trends,
      },
      traffic: overview.data?.traffic || [],
      tenantAnalytics: tenants
    };
  } catch (error) {
    console.error("Error fetching super admin dashboard data:", error);
    return {
      stats: {
        totalTenants: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalReviews: 0,
        requestsLast24h: 0,
        plans: {},
        statuses: {},
        trends: {},
      },
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
