"use client";
import SmsSetting from "@/features/admin/setting/components/SmsSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function SmsPage() {
    const { formData, setFormData } = useAdminSettings();
    return <SmsSetting formData={formData} setFormData={setFormData} />;
}
