import TenantList from "@/components/super-admin/TenantList";
import { fetchAPI } from "@/lib/api";

async function getTenants() {
  try {
    const res = await fetchAPI('/super-admin/tenants');
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
