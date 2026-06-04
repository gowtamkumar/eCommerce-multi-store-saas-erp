'use client';

import GrnDetailPage from '@/features/admin/grn/components/GrnDetailPage';
import { useGrnDetail } from '@/features/admin/grn/hooks/useGrnDetail';

export default function GrnPage() {
    const {
        grn,
        loading,
        isProcessing,
        handleVerify,
        handleReject,
        router,
    } = useGrnDetail();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!grn) {
        return (
            <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">GRN not found</p>
                <button onClick={() => router.back()} className="mt-4 text-brand-600 font-black text-xs uppercase tracking-widest">Go Back</button>
            </div>
        );
    }

    return (
        <GrnDetailPage
            grn={grn}
            onVerify={handleVerify}
            onReject={handleReject}
            isProcessing={isProcessing}
        />
    );
}

