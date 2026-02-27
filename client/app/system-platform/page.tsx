import SuperAdminDashboard from "@/features/system-platform/components/SuperAdminDashboard";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";


async function getSuperAdminDashboardData() {
  try {
    const [overview, analyticsRes] = await Promise.all([
      fetchSuperAdminAPI('/super-admin/overview'),
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
        requestsLast24h: 0,
        plans: {},
        statuses: {},
      },
      traffic: [],
      tenantAnalytics: []
    };
  }
}

export default async function SuperAdminOverviewPage() {
  const data = await getSuperAdminDashboardData();

  return (
    <SuperAdminDashboard
      stats={data.stats}
      traffic={data.traffic}
      tenantAnalytics={data.tenantAnalytics}
    />
  );
}
