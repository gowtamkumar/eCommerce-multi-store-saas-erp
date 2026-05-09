"use client";
import OffersPageSetting from "@/features/admin/setting/components/OffersPageSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function OffersPage() {
    const { formData, setFormData } = useAdminSettings();
    return <OffersPageSetting formData={formData} setFormData={setFormData} />;
}
