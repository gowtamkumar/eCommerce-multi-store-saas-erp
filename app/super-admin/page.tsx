import SuperAdminDashboard from "@/components/super-admin/SuperAdminDashboard";
import { fetchAPI } from "@/lib/api";

async function getSuperAdminDashboardData() {
  try {
    const [healthRes, trafficRes, analyticsRes] = await Promise.all([
      fetchAPI('/super-admin/health'),
      fetchAPI('/super-admin/traffic?days=7'),
      fetchAPI('/super-admin/tenants/analytics')
    ]);

    return {
      stats: {
        totalTenants: healthRes.data?.stats?.totalTenants || 0,
        totalUsers: healthRes.data?.stats?.totalUsers || 0,
        totalOrders: healthRes.data?.stats?.totalOrders || 0,
        totalReviews: healthRes.data?.stats?.totalReviews || 0,
        requestsLast24h: healthRes.data?.stats?.totalRequestsLast24h || 0,
        plans: healthRes.data?.stats?.plans || {},
        statuses: healthRes.data?.stats?.statuses || {},
      },
      traffic: trafficRes.data || [],
      tenantAnalytics: analyticsRes.data || []
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
