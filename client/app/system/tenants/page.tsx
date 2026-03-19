import TenantList from "@/features/system/components/TenantList";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";

async function getTenants() {
  try {
    const res = await fetchSuperAdminAPI('/super-admin/tenants');
    return res.data || [];
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return [];
  }
}

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <TenantList initialTenants={tenants} />
  );
}
