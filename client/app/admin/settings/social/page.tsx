"use client";
import SocialSetting from "@/features/admin/setting/components/SocialSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function SocialPage() {
    const { formData, setFormData } = useAdminSettings();
    return <SocialSetting formData={formData} setFormData={setFormData} />;
}
