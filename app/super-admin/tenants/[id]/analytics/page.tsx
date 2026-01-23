import TenantAnalytics from "@/components/super-admin/TenantAnalytics";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";

async function getTenantAnalyticsData(id: string) {
    const session = await getServerSession(authOptions);
    const token = session?.user?.accessToken;

    if (!token) {
        console.warn("[SuperAdmin] No access token found in session");
        return null;
    }

    try {
        const [analyticsRes, tenantRes] = await Promise.all([
            fetch(`${API_URL}/super-admin/tenants/${id}/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json()),
            fetch(`${API_URL}/super-admin/tenants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())
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
