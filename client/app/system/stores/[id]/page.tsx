import { redirect } from 'next/navigation';

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    redirect(`/system/stores/${resolvedParams.id}/analytics`);
}
