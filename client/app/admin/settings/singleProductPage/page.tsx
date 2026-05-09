"use client";
import SingleProductPageSetting from "@/features/admin/setting/components/SingleProductPageSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function SingleProductPage() {
    const { formData, setFormData } = useAdminSettings();
    return <SingleProductPageSetting formData={formData} setFormData={setFormData} />;
}
