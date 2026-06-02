"use client";
import MarketingSetting from "@/features/admin/setting/components/MarketingSetting";
import SocialSetting from "@/features/admin/setting/components/SocialSetting";
import { SEOSection } from "@/features/admin/setting/components/SettingsSections";
import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

export default function MarketingPage() {
    const { formData, setFormData } = useAdminSettings();
    return (
        <div className="space-y-12">
            <SEOSection formData={formData} setFormData={setFormData} />
            
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                <MarketingSetting formData={formData} setFormData={setFormData} />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                <SocialSetting formData={formData} setFormData={setFormData} />
            </div>
        </div>
    );
}
