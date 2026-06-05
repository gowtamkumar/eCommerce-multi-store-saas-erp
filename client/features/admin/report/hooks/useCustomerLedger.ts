'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { CustomerLedgerData, CustomerOption } from '../types';
import { useReportExport } from './useReportExport';

export function useCustomerLedger() {
    const [customers, setCustomers] = useState<CustomerOption[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [ledgerData, setLedgerData] = useState<CustomerLedgerData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const { exportReport, isExporting } = useReportExport();

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const res = await fetchAPI('/customer');
                setCustomers(res?.data?.items || []);
            } catch (error) {
                console.error('Failed to load customers', error);
                toast.error('Failed to load customers');
            } finally {
                setIsInitialLoading(false);
            }
        };
        void loadCustomers();
    }, []);

    const fetchLedger = useCallback(async (customerId: string) => {
        if (!customerId) {
            setLedgerData(null);
            return;
        }
        try {
            setIsLoading(true);
            const res = await fetchAPI(`/report/customer-ledger/${customerId}`);
            setLedgerData(res?.data || null);
        } catch (error) {
            console.error('Ledger fetch error:', error);
            toast.error('Failed to load ledger data');
            setLedgerData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCustomerId) {
            void fetchLedger(selectedCustomerId);
        } else {
            setLedgerData(null);
        }
    }, [selectedCustomerId, fetchLedger]);

    const handleCustomerChange = useCallback((id: string) => {
        setSelectedCustomerId(id);
    }, []);

    const handleExportCsv = useCallback(() => {
        if (!selectedCustomerId) return;
        void exportReport({ type: 'customer-ledger', customerId: selectedCustomerId });
    }, [exportReport, selectedCustomerId]);

    return {
        customers,
        selectedCustomerId,
        ledgerData,
        isLoading,
        isInitialLoading,
        isExporting,
        handleCustomerChange,
        handleExportCsv,
    };
}
