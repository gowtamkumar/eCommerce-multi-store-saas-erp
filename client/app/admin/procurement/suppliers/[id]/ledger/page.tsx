'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SupplierAPLedger from '@/features/admin/supplier/components/SupplierAPLedger';
import { fetchAPI } from '@/services/api';

export default function SupplierLedgerPage() {
    const { id } = useParams();
    const [supplier, setSupplier] = useState<any>(null);
    const [ledgerEntries, setLedgerEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const [supplierRes, ledgerRes] = await Promise.all([
                fetchAPI(`suppliers/${id}`),
                fetchAPI(`suppliers/${id}/ledger?page=${page}&limit=20`)
            ]);

            if (supplierRes.success) setSupplier(supplierRes.data);
            if (ledgerRes.success) {
                setLedgerEntries(ledgerRes.data.items);
                setPagination({
                    page: ledgerRes.data.page,
                    totalPages: ledgerRes.data.totalPages
                });
            }
        } catch (error) {
            console.error('Failed to fetch ledger data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    return (
        <SupplierAPLedger
            supplier={supplier}
            ledgerEntries={ledgerEntries}
            loading={loading}
            pagination={pagination}
            onPageChange={fetchData}
        />
    );
}
