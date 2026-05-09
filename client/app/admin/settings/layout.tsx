import { AdminSettingsProvider } from "@/features/admin/setting/context/AdminSettingsContext";
import { SettingsLayout } from "@/features/admin/setting/components/SettingsLayout";

export default function RootSettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminSettingsProvider>
            <SettingsLayout>
                {children}
            </SettingsLayout>
        </AdminSettingsProvider>
    );
}
