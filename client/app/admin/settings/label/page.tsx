"use client";
import LabelSetting from "@/features/admin/setting/components/LabelSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function LabelPage() {
    const { formData, setFormData } = useAdminSettings();
    return <LabelSetting formData={formData} setFormData={setFormData} />;
}
