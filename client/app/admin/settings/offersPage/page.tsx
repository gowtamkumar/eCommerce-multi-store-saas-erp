"use client";
import AdminSettingsPage from "@/app/admin/settings/AdminSettingsPage";
import OffersPageSetting from "@/features/admin/setting/components/OffersPageSetting";

export default function OffersPage() {
    return <AdminSettingsPage SettingComponent={OffersPageSetting} />;
}
