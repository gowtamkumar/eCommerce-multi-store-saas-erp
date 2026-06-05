'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { ReportExportPartyOption } from '../types';
import { ReportExportType, useReportExport } from './useReportExport';

function firstOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

function today(): string {
    return new Date().toISOString().split('T')[0];
}

export function useReportExportCenter() {
    const [reportType, setReportType] = useState<ReportExportType>('sales');
    const [startDate, setStartDate] = useState(firstOfMonth);
    const [endDate, setEndDate] = useState(today);
    const [suppliers, setSuppliers] = useState<ReportExportPartyOption[]>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [customers, setCustomers] = useState<ReportExportPartyOption[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const { exportReport, isExporting } = useReportExport();

    useEffect(() => {
        if (reportType === 'supplier-ledger') {
            const loadSuppliers = async () => {
                try {
                    const res = await fetchAPI('/suppliers');
                    setSuppliers(res?.data?.items || []);
                } catch (error) {
                    console.error('Failed to load suppliers', error);
                    toast.error('Failed to load suppliers');
                }
            };
            void loadSuppliers();
        } else if (reportType === 'customer-ledger') {
            const loadCustomers = async () => {
                try {
                    const res = await fetchAPI('/customer');
                    setCustomers(res?.data?.items || []);
                } catch (error) {
                    console.error('Failed to load customers', error);
                    toast.error('Failed to load customers');
                }
            };
            void loadCustomers();
        }
    }, [reportType]);

    const handleExport = useCallback(() => {
        void exportReport({
            type: reportType,
            startDate,
            endDate,
            supplierId: selectedSupplierId || undefined,
            customerId: selectedCustomerId || undefined,
        });
    }, [exportReport, reportType, startDate, endDate, selectedSupplierId, selectedCustomerId]);

    const handleTypeChange = useCallback((type: string) => {
        setReportType(type as ReportExportType);
    }, []);

    return {
        reportType,
        startDate,
        endDate,
        suppliers,
        selectedSupplierId,
        customers,
        selectedCustomerId,
        isExporting,
        setStartDate,
        setEndDate,
        setSelectedSupplierId,
        setSelectedCustomerId,
        handleExport,
        handleTypeChange,
    };
}
