import SuperAdminDashboard from "@/components/super-admin/SuperAdminDashboard";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";

async function getSuperAdminDashboardData() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;

  try {
    const [healthRes, trafficRes, analyticsRes] = await Promise.all([
      fetch(`${API_URL}/super-admin/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`${API_URL}/super-admin/traffic?days=7`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`${API_URL}/super-admin/tenants/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())
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
