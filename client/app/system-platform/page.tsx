import SuperAdminDashboard from "@/features/system-platform/components/SuperAdminDashboard";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";


async function getSuperAdminDashboardData() {
  try {
    const [overview, trafficRes, analyticsRes] = await Promise.all([
      fetchSuperAdminAPI('/super-admin/overview'),
      fetchSuperAdminAPI('/super-admin/traffic?days=7'),
      fetchSuperAdminAPI('/super-admin/tenants/analytics')
    ]);
    console.log("trafficRes", trafficRes);

    return {
      stats: {
        totalTenants: overview.data?.totalTenants || 0,
        totalUsers: overview.data?.totalUsers || 0,
        totalOrders: overview.data?.totalOrders || 0,
        requestsLast24h: overview.data?.totalRequestsLast24h || 0,
        plans: {},
        statuses: {},
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
