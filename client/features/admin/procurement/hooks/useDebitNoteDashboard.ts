'use client';

import { approveDebitNote, getDebitNotes } from '@/services/procurement';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { DebitNote, DebitNotePagination } from '../types';

export function useDebitNoteDashboard() {
    const [debitNotes, setDebitNotes] = useState<DebitNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<DebitNote | null>(null);
    const [pagination, setPagination] = useState<DebitNotePagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Modals
    const [createOpen, setCreateOpen] = useState(false);

    const fetchDebitNotes = useCallback(async (page: number = 1) => {
        try {
            setLoading(true);
            const res = await getDebitNotes(page, 10);
            if (res.success && res.data) {
                setDebitNotes(res.data.items || []);
                setPagination({
                    page: res.data.page,
                    limit: res.data.limit,
                    total: res.data.total,
                    totalPages: res.data.totalPages,
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load debit notes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchDebitNotes(1);
    }, [fetchDebitNotes]);

    const handleApprove = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to approve this debit note? This will perform write-locked accounts payable reductions and record general ledger entries.')) return;

        try {
            await approveDebitNote(id);
            toast.success('Debit note approved and posted to ledger successfully');
            setSelectedNote(null);
            void fetchDebitNotes(pagination.page);
        } catch (err) {
            console.error(err);
            toast.error('Failed to approve debit note');
        }
    }, [fetchDebitNotes, pagination.page]);

    const handlePageChange = useCallback((page: number) => {
        void fetchDebitNotes(page);
    }, [fetchDebitNotes]);

    return {
        debitNotes,
        loading,
        searchQuery,
        setSearchQuery,
        selectedNote,
        setSelectedNote,
        pagination,
        createOpen,
        setCreateOpen,
        fetchDebitNotes,
        handleApprove,
        handlePageChange,
    };
}
