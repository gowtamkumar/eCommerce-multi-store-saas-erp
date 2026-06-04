'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { getUsers } from '@/services/user';
import {
    getCustomerWallet,
    manualCreditWallet,
    manualDebitWallet,
    type WalletSummary,
} from '@/services/wallet';
import type { WalletAdjustmentType, WalletCustomerRow } from '../types';

interface UserResponse {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

function mapUserToCustomer(user: UserResponse): WalletCustomerRow {
    return {
        id: user.id,
        name: user.name || 'Unnamed Customer',
        email: user.email || 'N/A',
        phone: user.phone,
        role: user.role,
        walletBalance: 0,
    };
}

export function useWalletManagement() {
    const [customers, setCustomers] = useState<WalletCustomerRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [selectedCustomerWallet, setSelectedCustomerWallet] = useState<WalletSummary | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [adjustmentType, setAdjustmentType] = useState<WalletAdjustmentType | null>(null);
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustNote, setAdjustNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const users = await getUsers();
            const list = (Array.isArray(users) ? users : []) as UserResponse[];
            setCustomers(list.map(mapUserToCustomer));
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load customers'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCustomers();
    }, [loadCustomers]);

    const fetchWalletDetails = useCallback(async (customerId: string) => {
        setHistoryLoading(true);
        try {
            const summary = await getCustomerWallet(customerId);
            setSelectedCustomerWallet(summary);
            setCustomers((prev) => prev.map((customer) => (
                customer.id === customerId
                    ? { ...customer, walletBalance: summary.balance }
                    : customer
            )));
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to fetch customer wallet details'));
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    const selectCustomer = useCallback((customerId: string) => {
        setSelectedCustomerId(customerId);
        void fetchWalletDetails(customerId);
    }, [fetchWalletDetails]);

    const closeAdjustmentModal = useCallback(() => {
        setAdjustmentType(null);
        setAdjustAmount('');
        setAdjustNote('');
    }, []);

    const openAdjustmentModal = useCallback((type: WalletAdjustmentType) => {
        setAdjustmentType(type);
    }, []);

    const submitAdjustment = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedCustomerId || !adjustmentType) return;

        const amount = parseFloat(adjustAmount);
        if (Number.isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount greater than 0');
            return;
        }

        setSubmitting(true);
        try {
            if (adjustmentType === 'credit') {
                await manualCreditWallet(selectedCustomerId, amount, adjustNote || 'Admin manual top-up');
                toast.success('Customer wallet credited successfully');
            } else {
                await manualDebitWallet(selectedCustomerId, amount, adjustNote || 'Admin manual debit adjustment');
                toast.success('Customer wallet debited successfully');
            }

            await fetchWalletDetails(selectedCustomerId);
            closeAdjustmentModal();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Adjustment failed'));
        } finally {
            setSubmitting(false);
        }
    }, [
        adjustAmount,
        adjustNote,
        adjustmentType,
        closeAdjustmentModal,
        fetchWalletDetails,
        selectedCustomerId,
    ]);

    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return customers;

        return customers.filter((customer) => (
            customer.name.toLowerCase().includes(query) ||
            customer.email.toLowerCase().includes(query) ||
            customer.phone?.toLowerCase().includes(query)
        ));
    }, [customers, search]);

    const selectedCustomerInfo = useMemo(() => (
        customers.find((customer) => customer.id === selectedCustomerId)
    ), [customers, selectedCustomerId]);

    return {
        customers,
        filteredCustomers,
        loading,
        search,
        setSearch,
        selectedCustomerId,
        selectedCustomerInfo,
        selectedCustomerWallet,
        historyLoading,
        adjustmentType,
        adjustAmount,
        setAdjustAmount,
        adjustNote,
        setAdjustNote,
        submitting,
        loadCustomers,
        selectCustomer,
        openAdjustmentModal,
        closeAdjustmentModal,
        submitAdjustment,
    };
}
