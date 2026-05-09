"use client";
import FooterSetting from "@/features/admin/setting/components/FooterSetting";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function FooterPage() {
    const { formData, setFormData, collapsedFooterSections, setCollapsedFooterSections } = useAdminSettings();
    return <FooterSetting formData={formData} setFormData={setFormData} collapsedFooterSections={collapsedFooterSections} setCollapsedFooterSections={setCollapsedFooterSections} />;
}
