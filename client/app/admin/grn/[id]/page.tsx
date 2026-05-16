'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import GrnDetailPage from '@/features/admin/grn/components/GrnDetailPage';
import { GrnStatus } from '@/lib/enums/grn-status.enum';
import { toast } from 'react-hot-toast';
import { fetchAPI } from '@/services/api';

export default function GrnPage() {
    const { id } = useParams();
    const router = useRouter();
    const [grn, setGrn] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchGrn = async () => {
        setLoading(true);
        try {
            const response = await fetchAPI(`operations/logistics/grn/${id}`);
            if (response.success) {
                setGrn(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch GRN:', error);
            toast.error('Failed to load GRN details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchGrn();
    }, [id]);

    const handleVerify = async () => {
        if (!confirm('Are you sure you want to verify this GRN? This will update stock levels and supplier payables.')) return;

        setIsProcessing(true);
        try {
            const response = await fetchAPI(`operations/logistics/grn/${id}/verify`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: GrnStatus.VERIFIED,
                })
            });
            if (response.success) {
                toast.success('GRN verified successfully');
                fetchGrn();
            }
        } catch (error) {
            console.error('Verification failed:', error);
            toast.error('Failed to verify GRN');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        const notes = prompt('Enter reason for rejection:');
        if (notes === null) return;

        setIsProcessing(true);
        try {
            const response = await fetchAPI(`operations/logistics/grn/${id}/verify`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: GrnStatus.REJECTED,
                    notes
                })
            });
            if (response.success) {
                toast.success('GRN rejected');
                fetchGrn();
            }
        } catch (error) {
            console.error('Rejection failed:', error);
            toast.error('Failed to reject GRN');
        } finally {
            setIsProcessing(false);
        }
    };

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
