import PlanList from "@/features/system/components/PlanList";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";

async function getPlans() {
    try {
        const res = await fetchSuperAdminAPI('/super-admin/plans');
        return res.data || [];
    } catch (error) {
        console.error("Error fetching plans:", error);
        return [];
    }
}

export default async function PlansPage() {
    const plans = await getPlans();

    return (
        <div className="w-full">
            <PlanList initialPlans={plans} />
        </div>
    );
}
