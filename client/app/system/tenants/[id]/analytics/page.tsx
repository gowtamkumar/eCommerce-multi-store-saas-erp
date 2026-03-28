import TenantAnalytics from "@/features/system/components/TenantAnalytics";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";
import { notFound } from "next/navigation";


async function getTenantAnalyticsData(id: string) {

    try {
        const [analyticsRes, tenantRes] = await Promise.all([
            fetchSuperAdminAPI(`/tenant-traffic/tenants/${id}/analytics`),
            fetchSuperAdminAPI(`/tenant-traffic/tenants`)
        ]);

        if (!analyticsRes.success || !tenantRes.success) {
            console.error("[SuperAdmin] API error:", analyticsRes.message || tenantRes.message);
            return null;
        }

        const tenant = tenantRes.data.find((t: any) => t.id === id);

        return {
            analytics: analyticsRes.data,
            tenantName: tenant?.storeName || 'Unknown Merchant'
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
