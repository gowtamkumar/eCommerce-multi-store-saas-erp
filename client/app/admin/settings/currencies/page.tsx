"use client";
import CurrenciesSetting from "@/features/admin/setting/components/CurrenciesSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function CurrenciesPage() {
    const { formData, setFormData } = useAdminSettings();
    return <CurrenciesSetting formData={formData} setFormData={setFormData} />;
}
