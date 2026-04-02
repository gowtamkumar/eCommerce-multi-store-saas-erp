'use client';

import AcceptInvitation from '@/features/storefront/auth/components/AcceptInvitation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AcceptInvitationContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    if (!token) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invalid Link</h1>
                    <p className="text-slate-500 dark:text-slate-400">The invitation link is missing a valid token.</p>
                </div>
            </div>
        );
    }

    return <AcceptInvitation token={token} />;
}

export default function AcceptInvitationPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Suspense fallback={<div className="animate-pulse text-slate-400">Loading invitation...</div>}>
                <AcceptInvitationContent />
            </Suspense>
        </main>
    );
}
