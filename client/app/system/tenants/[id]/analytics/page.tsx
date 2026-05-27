import TenantAnalytics from "@/features/system/components/TenantAnalytics";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";
import { notFound } from "next/navigation";


async function getTenantData(id: string) {
    try {
        const [analyticsRes, tenantRes] = await Promise.all([
            fetchSuperAdminAPI(`/super-admin/tenants/${id}/analytics`),
            fetchSuperAdminAPI(`/super-admin/tenants/${id}`),
        ]);

        if (!analyticsRes.success || !tenantRes.success) {
            console.error("[SuperAdmin] API error:", analyticsRes.message || tenantRes.message);
            return null;
        }

        return {
            analytics: analyticsRes.data,
            tenant: tenantRes.data,
        };
    } catch (error) {
        console.error("[SuperAdmin] Fetch error in getTenantData:", error);
        return null;
    }
}

export default async function TenantAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const data = await getTenantData(resolvedParams.id);

    if (!data) {
        notFound();
    }

    return (
        <TenantAnalytics
            tenantId={resolvedParams.id}
            data={data.analytics}
            tenant={data.tenant}
        />
    );
}
