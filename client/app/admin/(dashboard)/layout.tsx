import AdminLayout from "@/features/dashboard/components/AdminLayout";

export default function page({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}