"use client";
import CourierSetting from "@/features/admin/setting/components/CourierSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function CourierPage() {
    const { formData, setFormData } = useAdminSettings();
    return <CourierSetting formData={formData} setFormData={setFormData} />;
}
