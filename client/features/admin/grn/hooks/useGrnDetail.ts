'use client';

import { GrnStatus } from '@/lib/enums/grn-status.enum';
import { fetchAPI } from '@/services/api';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { GrnData } from '../types';

export function useGrnDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [grn, setGrn] = useState<GrnData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchGrn = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await fetchAPI(`/operations/logistics/grn/${id}`);
            if (response.success) {
                setGrn(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch GRN:', error);
            toast.error('Failed to load GRN details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            void fetchGrn();
        }
    }, [id, fetchGrn]);

    const handleVerify = useCallback(async () => {
        if (!confirm('Are you sure you want to verify this GRN? This will update stock levels and supplier payables.')) return;

        setIsProcessing(true);
        try {
            const response = await fetchAPI(`/operations/logistics/grn/${id}/verify`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: GrnStatus.RECEIVED,
                })
            });
            if (response.success) {
                toast.success('GRN verified successfully');
                void fetchGrn();
            }
        } catch (error) {
            console.error('Verification failed:', error);
            toast.error('Failed to verify GRN');
        } finally {
            setIsProcessing(false);
        }
    }, [id, fetchGrn]);

    const handleReject = useCallback(async () => {
        const notes = prompt('Enter reason for rejection:');
        if (notes === null) return;

        setIsProcessing(true);
        try {
            const response = await fetchAPI(`/operations/logistics/grn/${id}/verify`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: GrnStatus.REJECTED,
                    notes
                })
            });
            if (response.success) {
                toast.success('GRN rejected');
                void fetchGrn();
            }
        } catch (error) {
            console.error('Rejection failed:', error);
            toast.error('Failed to reject GRN');
        } finally {
            setIsProcessing(false);
        }
    }, [id, fetchGrn]);

    return {
        grn,
        loading,
        isProcessing,
        handleVerify,
        handleReject,
        router,
    };
}
