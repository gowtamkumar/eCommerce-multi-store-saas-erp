"use client";
import PaymentSetting from "@/features/admin/setting/components/PaymentSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function PaymentPage() {
    const { formData, setFormData } = useAdminSettings();
    return <PaymentSetting formData={formData} setFormData={setFormData} />;
}
