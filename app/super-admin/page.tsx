import SuperAdminDashboard from "@/components/super-admin/SuperAdminDashboard";
import { fetchAPI } from "@/lib/api";

async function getSuperAdminStats() {
  try {
    // Fetch health data which includes stats
    const res = await fetchAPI('/super-admin/health');
    if (res.data) {
      return {
        totalTenants: res.data.stats?.tenants || 0,
        totalUsers: res.data.stats?.users || 0,
        activePlans: 0,
        estimatedRevenue: 0
      };
    }

    // Fallback to tenants list if health fails
    const tenantsRes = await fetchAPI('/tenants');
    return {
      totalTenants: tenantsRes.data?.length || 0,
      totalUsers: 0,
      activePlans: 0,
      estimatedRevenue: 0
    };
  } catch (error) {
    console.error("Error fetching super admin stats:", error);
    return {
      totalTenants: 0,
      totalUsers: 0,
      activePlans: 0,
      estimatedRevenue: 0
    };
  }
}

export default async function SuperAdminOverviewPage() {
  const stats = await getSuperAdminStats();

  return (
    <SuperAdminDashboard stats={stats} />
  );
}
