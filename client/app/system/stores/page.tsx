import StoreList from "@/features/system/components/StoreList";
import { fetchSuperAdminAPI } from "@/services/superAdminApi";

async function getStores() {
  try {
    const res = await fetchSuperAdminAPI('/super-admin/stores');
    return res.data || [];
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
}

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <StoreList initialStores={stores} />
  );
}
