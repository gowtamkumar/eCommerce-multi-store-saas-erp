"use client";
import MarketingSetting from "@/features/admin/setting/components/MarketingSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function MarketingPage() {
    const { formData, setFormData } = useAdminSettings();
    return <MarketingSetting formData={formData} setFormData={setFormData} />;
}
