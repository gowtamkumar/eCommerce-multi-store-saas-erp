import { redirect } from 'next/navigation';

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    redirect(`/system/tenants/${resolvedParams.id}/analytics`);
}
