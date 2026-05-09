"use client";
import TrustDelivery from "@/features/admin/setting/components/Trust&Delivery";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function TrustPage() {
    const { formData, setFormData } = useAdminSettings();
    return <TrustDelivery formData={formData} setFormData={setFormData} />;
}
