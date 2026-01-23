import { fetchAPI } from "@/lib/api";
import TenantAnalytics from "@/components/super-admin/TenantAnalytics";
import { notFound } from "next/navigation";

async function getTenantAnalyticsData(id: string) {
    try {
        const [analyticsRes, tenantRes] = await Promise.all([
            fetchAPI(`/super-admin/tenants/${id}/analytics`),
            fetchAPI(`/super-admin/tenants`)
        ]);

        const tenant = tenantRes.data.find((t: any) => t.id === id);

        return {
            analytics: analyticsRes.data,
            tenantName: tenant?.storeName || 'Unknown Merchant'
        };
    } catch (error) {
        console.error("Error fetching tenant analytics:", error);
        return null;
    }
}

export default async function TenantAnalyticsPage({ params }: { params: { id: string } }) {
    const data = await getTenantAnalyticsData(params.id);

    if (!data) {
        notFound();
    }

    return (
        <TenantAnalytics
            tenantId={params.id}
            data={data.analytics}
            tenantName={data.tenantName}
        />
    );
}
