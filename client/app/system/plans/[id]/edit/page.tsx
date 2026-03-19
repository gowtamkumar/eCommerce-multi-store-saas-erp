import PlanForm from "@/features/system/components/PlanForm";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";

async function getPlan(id: string) {
    try {
        const res = await fetchSuperAdminAPI(`/super-admin/plans/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching plan:", error);
        return null;
    }
}

export default async function EditPlanPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const plan = await getPlan(id);

    if (!plan) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Plan not found</h2>
                <p className="text-slate-500">The subscription plan you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <PlanForm initialData={plan} isEditing={true} />
        </div>
    );
}
