'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import {
    createAccount,
    deleteAccount,
    getAccounts,
    initializeAccounting,
    updateAccount,
} from '@/services/accounting';
import type { ChartAccount, ChartAccountFormData } from '../types';

const DEFAULT_FORM_DATA: ChartAccountFormData = {
    code: '',
    name: '',
    type: 'ASSET',
    category: 'CASH_BANK',
};

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function useChartOfAccounts() {
    const [accounts, setAccounts] = useState<ChartAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<ChartAccount | null>(null);
    const [formData, setFormData] = useState<ChartAccountFormData>(DEFAULT_FORM_DATA);

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAccounts();
            setAccounts(res?.data || []);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load Chart of Accounts'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchAccounts();
    }, [fetchAccounts]);

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

    const openEditModal = useCallback((account: ChartAccount) => {
        setSelectedAccount(account);
        setFormData({
            code: account.code,
            name: account.name,
            type: account.type,
            category: account.category,
        });
    }, []);

    const closeEditModal = useCallback(() => {
        setSelectedAccount(null);
        resetForm();
    }, [resetForm]);

    const setFormField = useCallback((field: keyof ChartAccountFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const initializeCoa = useCallback(async () => {
        try {
            await initializeAccounting();
            toast.success('Default Chart of Accounts seeded!');
            await fetchAccounts();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to initialize accounts'));
        }
    }, [fetchAccounts]);

    const createChartAccount = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        if (!formData.code || !formData.name) return;

        try {
            await createAccount(formData);
            toast.success('Account created successfully');
            closeCreateModal();
            await fetchAccounts();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to create account'));
        }
    }, [closeCreateModal, fetchAccounts, formData]);

    const updateChartAccount = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedAccount || !formData.name) return;

        try {
            await updateAccount(selectedAccount.id, {
                name: formData.name,
                type: formData.type,
                category: formData.category,
            });
            toast.success('Account updated successfully');
            closeEditModal();
            await fetchAccounts();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to update account'));
        }
    }, [closeEditModal, fetchAccounts, formData, selectedAccount]);

    const deleteChartAccount = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) return;

        try {
            await deleteAccount(id);
            toast.success('Account deleted successfully');
            await fetchAccounts();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete account'));
        }
    }, [fetchAccounts]);

    const filteredAccounts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return accounts;

        return accounts.filter((account) => (
            account.name.toLowerCase().includes(query) ||
            account.code.toLowerCase().includes(query)
        ));
    }, [accounts, searchQuery]);

    return {
        accounts,
        filteredAccounts,
        loading,
        searchQuery,
        setSearchQuery,
        createOpen,
        selectedAccount,
        formData,
        setFormField,
        fetchAccounts,
        initializeCoa,
        openCreateModal,
        closeCreateModal,
        openEditModal,
        closeEditModal,
        createChartAccount,
        updateChartAccount,
        deleteChartAccount,
    };
}
