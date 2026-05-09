"use client";
import { EmailSetting } from "@/features/admin/setting/components/EmailSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function EmailPage() {
    const { formData, setFormData } = useAdminSettings();
    return <EmailSetting formData={formData} setFormData={setFormData} />;
}
