"use client";

import { useAdminSettings } from "@/features/admin/setting/context/AdminSettingsContext";

/**
 * Generic wrapper for admin settings pages.
 * It extracts the admin settings context (`formData` & `setFormData`) and
 * renders the specific setting component passed via the `SettingComponent`
 * prop. This eliminates repetitive boilerplate across all settings pages.
 */
type SettingComponentProps = {
  formData: unknown;
  setFormData: (data: unknown) => void;
};

export default function AdminSettingsPage({
  SettingComponent,
}: {
  SettingComponent: React.ComponentType<SettingComponentProps>;
}) {
  const { formData, setFormData } = useAdminSettings();
  return <SettingComponent formData={formData} setFormData={setFormData} />;
}
