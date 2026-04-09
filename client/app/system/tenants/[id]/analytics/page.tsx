import TenantAnalytics from "@/features/system/components/TenantAnalytics";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";
import { notFound } from "next/navigation";


async function getTenantAnalyticsData(id: string) {
    try {
        const res = await fetchSuperAdminAPI(`/super-admin/tenants/${id}/analytics`);

        if (!res.success) {
            console.error("[SuperAdmin] API error:", res.message);
            return null;
        }

        return {
            analytics: res.data,
            tenantName: res.data.tenantInfo?.storeName || 'Unknown Merchant'
        };
    } catch (error) {
        console.error("[SuperAdmin] Fetch error in getTenantAnalyticsData:", error);
        return null;
    }
}

export default async function TenantAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const data = await getTenantAnalyticsData(resolvedParams.id);

    if (!data) {
        notFound();
    }

    return (
        <TenantAnalytics
            tenantId={resolvedParams.id}
            data={data.analytics}
            tenantName={data.tenantName}
        />
    );
}
