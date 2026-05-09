"use client";
import NavbarSetting from "@/features/admin/setting/components/NavbarSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function NavbarPage() {
    const { formData, setFormData } = useAdminSettings();
    return <NavbarSetting formData={formData} setFormData={setFormData} />;
}
