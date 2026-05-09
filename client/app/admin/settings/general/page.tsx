"use client";
import GeneralSettings from "@/features/admin/setting/components/GeneralSettings";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function GeneralPage() {
    const { formData, setFormData } = useAdminSettings();
    return <GeneralSettings formData={formData} setFormData={setFormData} />;
}
