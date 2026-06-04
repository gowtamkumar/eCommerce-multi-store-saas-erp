'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import {
    createFiscalPeriod,
    getFiscalPeriods,
    updateFiscalPeriodStatus,
} from '@/services/accounting';
import type { FiscalPeriod, FiscalPeriodFormData } from '../types';

const DEFAULT_FORM_DATA: FiscalPeriodFormData = {
    name: '',
    startDate: '',
    endDate: '',
};

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function useFiscalPeriods() {
    const [periods, setPeriods] = useState<FiscalPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState<FiscalPeriodFormData>(DEFAULT_FORM_DATA);

    const fetchPeriods = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getFiscalPeriods();
            setPeriods(res?.data || []);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load fiscal periods'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchPeriods();
    }, [fetchPeriods]);

    const resetForm = useCallback(() => {
        setFormData(DEFAULT_FORM_DATA);
    }, []);

    const openCreateModal = useCallback(() => {
        resetForm();
        setCreateOpen(true);
    }, [resetForm]);

    const closeCreateModal = useCallback(() => {
        setCreateOpen(false);
        resetForm();
    }, [resetForm]);

    const setFormField = useCallback((field: keyof FiscalPeriodFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const createPeriod = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        if (!formData.name || !formData.startDate || !formData.endDate) return;

        try {
            await createFiscalPeriod(formData);
            toast.success('Fiscal Period created successfully');
            closeCreateModal();
            await fetchPeriods();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to create period'));
        }
    }, [closeCreateModal, fetchPeriods, formData]);

    const togglePeriodStatus = useCallback(async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        const actionText = nextStatus === 'CLOSED'
            ? 'CLOSE this period? All journal postings to this date range will be BLOCKED.'
            : 'RE-OPEN this period? Transactions within this date range can be posted again.';

        if (!confirm(`Are you sure you want to ${actionText}`)) return;

        try {
            await updateFiscalPeriodStatus(id, nextStatus);
            toast.success(`Fiscal period is now ${nextStatus}`);
            await fetchPeriods();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to update status'));
        }
    }, [fetchPeriods]);

    return {
        periods,
        loading,
        createOpen,
        formData,
        setFormField,
        fetchPeriods,
        openCreateModal,
        closeCreateModal,
        createPeriod,
        togglePeriodStatus,
    };
}
