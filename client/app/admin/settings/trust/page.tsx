"use client";
import TrustDelivery from "@/features/admin/setting/components/Trust&Delivery";
import LabelSetting from "@/features/admin/setting/components/LabelSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function TrustPage() {
    const { formData, setFormData } = useAdminSettings();
    return (
        <div className="space-y-12">
            <TrustDelivery formData={formData} setFormData={setFormData} />
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                <LabelSetting formData={formData} setFormData={setFormData} />
            </div>
        </div>
    );
}
