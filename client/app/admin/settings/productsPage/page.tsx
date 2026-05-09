"use client";
import ProductsPageSetting from "@/features/admin/setting/components/ProductsPageSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function ProductsPage() {
    const { formData, setFormData } = useAdminSettings();
    return <ProductsPageSetting formData={formData} setFormData={setFormData} />;
}
