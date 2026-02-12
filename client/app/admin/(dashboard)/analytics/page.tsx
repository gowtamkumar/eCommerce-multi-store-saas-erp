'use client';

import TenantAnalytics from "@/features/system-platform/components/TenantAnalytics";
import { fetchAPI } from "@/services/api";
import { Activity } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const res = await fetchAPI('/report/analytics');
                if (res.success) {
                    setData(res.data);
                }
            } catch (error) {
                console.error('Failed to load analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                <Activity className="w-8 h-8 animate-pulse mb-4" />
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                <p>Failed to load analytics data.</p>
            </div>
        );
    }

    // Adapt the response to the TenantAnalytics component props
    // TenantAnalytics expects "tenantId" (we can use session's tenantId) and "tenantName"
    // Since we are inside the admin panel, the user IS the tenant context.
    const tenantName = session?.user?.name || "Your Store";

    return (
        <TenantAnalytics
            tenantId={session?.user?.tenantId || "current"}
            data={data}
            tenantName={tenantName}
        />
    );
}
