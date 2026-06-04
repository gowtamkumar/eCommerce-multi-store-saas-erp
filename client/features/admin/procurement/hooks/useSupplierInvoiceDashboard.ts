'use client';

import { getSupplierInvoices } from '@/services/procurement';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { SupplierInvoice } from '../types';

export function useSupplierInvoiceDashboard() {
    const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);

    // Modals
    const [createOpen, setCreateOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSupplierInvoices();
            setInvoices(data);

            // Keep selected invoice data fresh if open
            if (selectedInvoice) {
                const fresh = data.find((i: SupplierInvoice) => i.id === selectedInvoice.id);
                if (fresh) {
                    setSelectedInvoice(fresh);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load supplier invoices');
        } finally {
            setLoading(false);
        }
    }, [selectedInvoice]);

    useEffect(() => {
        void fetchInvoices();
    }, []);

    return {
        invoices,
        loading,
        searchQuery,
        setSearchQuery,
        selectedInvoice,
        setSelectedInvoice,
        createOpen,
        setCreateOpen,
        payOpen,
        setPayOpen,
        fetchInvoices,
    };
}
