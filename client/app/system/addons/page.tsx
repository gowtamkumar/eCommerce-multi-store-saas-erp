import AddonCatalogList from "@/features/system/components/AddonCatalogList";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";

async function getAddonCatalog() {
    try {
        const res = await fetchSuperAdminAPI('/super-admin/addon-catalog');
        return res.data || [];
    } catch (error) {
        console.error("Error fetching addon catalog:", error);
        return [];
    }
}

export default async function AddonCatalogPage() {
    const addons = await getAddonCatalog();

    return (
        <div className="w-full">
            <AddonCatalogList initialAddons={addons} />
        </div>
    );
}
