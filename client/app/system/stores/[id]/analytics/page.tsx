import StoreAnalytics from "@/features/system/components/StoreAnalytics";
import { fetchSuperAdminAPI } from "@/services/superAdminApi";
import { notFound } from "next/navigation";


async function getStoreData(id: string) {
    try {
        const [analyticsRes, storeRes] = await Promise.all([
            fetchSuperAdminAPI(`/super-admin/stores/${id}/analytics`),
            fetchSuperAdminAPI(`/super-admin/stores/${id}`),
        ]);

        if (!analyticsRes.success || !storeRes.success) {
            console.error("[SuperAdmin] API error:", analyticsRes.message || storeRes.message);
            return null;
        }

        return {
            analytics: analyticsRes.data,
            store: storeRes.data,
        };
    } catch (error) {
        console.error("[SuperAdmin] Fetch error in getStoreData:", error);
        return null;
    }
}

export default async function StoreAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const data = await getStoreData(resolvedParams.id);

    if (!data) {
        notFound();
    }

    return (
        <StoreAnalytics
            storeId={resolvedParams.id}
            data={data.analytics}
            store={data.store}
        />
    );
}
