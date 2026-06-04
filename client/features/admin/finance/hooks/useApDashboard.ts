'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { ApAgingRow, ApTab, BatchPaymentResult, UnpaidInvoice } from '../types';

export function useApDashboard() {
    const [activeTab, setActiveTab] = useState<ApTab>('aging');
    const [agingData, setAgingData] = useState<ApAgingRow[]>([]);
    const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
    const [transactionId, setTransactionId] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentRunResult, setPaymentRunResult] = useState<BatchPaymentResult | null>(null);

    const fetchAging = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/supplier-invoices/aging');
            if (res.success) setAgingData(res.data || []);
        } catch {
            toast.error('Failed to load AP aging report');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnpaidInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/supplier-invoices');
            if (res.success) {
                const items = Array.isArray(res.data?.items) ? res.data.items : (res.data || []);
                const unpaid = items.filter((inv: UnpaidInvoice) => inv.status !== 'PAID' && inv.status !== 'CANCELLED');
                setUnpaidInvoices(unpaid);
            }
        } catch {
            toast.error('Failed to load unpaid invoices');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'aging') {
            void fetchAging();
        } else {
            void fetchUnpaidInvoices();
            setSelectedInvoiceIds([]);
            setPaymentRunResult(null);
        }
    }, [activeTab, fetchAging, fetchUnpaidInvoices]);

    const refresh = useCallback(() => {
        if (activeTab === 'aging') void fetchAging();
        else void fetchUnpaidInvoices();
    }, [activeTab, fetchAging, fetchUnpaidInvoices]);

    const toggleInvoice = useCallback((id: string) => {
        setSelectedInvoiceIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedInvoiceIds(prev =>
            prev.length === unpaidInvoices.length ? [] : unpaidInvoices.map(i => i.id)
        );
    }, [unpaidInvoices]);

    const runBatchPayment = useCallback(async () => {
        if (selectedInvoiceIds.length === 0) {
            toast.error('Please select at least one invoice to pay');
            return;
        }

        setProcessingPayment(true);
        const toastId = toast.loading('Running batch payments - posting debits to AP ledger...');
        try {
            const res = await fetchAPI('/supplier-invoices/batch-payment', {
                method: 'POST',
                body: JSON.stringify({
                    invoiceIds: selectedInvoiceIds,
                    paymentMethod,
                    transactionId: transactionId || `BATCH-${Date.now()}`,
                    note: paymentNote || 'Batch payment execution run',
                }),
            });

            if (res.success) {
                toast.success('Batch payment run completed successfully!', { id: toastId });
                setPaymentRunResult(res.data);
                void fetchUnpaidInvoices();
                setSelectedInvoiceIds([]);
                setTransactionId('');
                setPaymentNote('');
            } else {
                toast.error(res.message || 'Batch payment execution failed', { id: toastId });
            }
        } catch {
            toast.error('Error executing batch payment run', { id: toastId });
        } finally {
            setProcessingPayment(false);
        }
    }, [selectedInvoiceIds, paymentMethod, transactionId, paymentNote, fetchUnpaidInvoices]);

    const filteredAging = useMemo(() => {
        const q = search.toLowerCase();
        return agingData.filter(r =>
            r.supplierName.toLowerCase().includes(q) ||
            r.email?.toLowerCase().includes(q)
        );
    }, [agingData, search]);

    const filteredInvoices = useMemo(() => {
        const q = search.toLowerCase();
        return unpaidInvoices.filter(inv =>
            inv.invoiceNumber.toLowerCase().includes(q) ||
            inv.supplier?.name?.toLowerCase().includes(q)
        );
    }, [unpaidInvoices, search]);

    const totalOutstanding = useMemo(
        () => agingData.reduce((s, r) => s + Number(r.totalOutstanding), 0),
        [agingData],
    );
    const totalOverdue = useMemo(
        () => agingData.reduce((s, r) => s + r.aging['1-30'] + r.aging['31-60'] + r.aging['61-90'] + r.aging['90+'], 0),
        [agingData],
    );
    const selectedPaymentTotal = useMemo(
        () => unpaidInvoices
            .filter(inv => selectedInvoiceIds.includes(inv.id))
            .reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount || 0)), 0),
        [unpaidInvoices, selectedInvoiceIds],
    );

    const allSelected = unpaidInvoices.length > 0 && selectedInvoiceIds.length === unpaidInvoices.length;

    return {
        activeTab,
        setActiveTab,
        agingData,
        unpaidInvoices,
        loading,
        search,
        setSearch,
        selectedInvoiceIds,
        paymentMethod,
        setPaymentMethod,
        transactionId,
        setTransactionId,
        paymentNote,
        setPaymentNote,
        processingPayment,
        paymentRunResult,
        fetchAging,
        fetchUnpaidInvoices,
        refresh,
        toggleInvoice,
        toggleSelectAll,
        runBatchPayment,
        filteredAging,
        filteredInvoices,
        totalOutstanding,
        totalOverdue,
        selectedPaymentTotal,
        unpaidCount: unpaidInvoices.length,
        allSelected,
    };
}
