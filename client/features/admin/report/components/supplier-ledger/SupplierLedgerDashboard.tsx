'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SupplierLedgerData } from '../../types';
import SupplierLedgerHeader from './SupplierLedgerHeader';
import SupplierLedgerSummary from './SupplierLedgerSummary';
import SupplierLedgerTable from './SupplierLedgerTable';

const SupplierLedgerDashboard: React.FC = () => {
    const { formatPrice } = useSettings();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [ledgerData, setLedgerData] = useState<SupplierLedgerData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Initial load: Fetch all suppliers for the dropdown
    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const res = await fetchAPI('/suppliers');
                setSuppliers(res.data.items || []);
            } catch (error) {
                toast.error('Failed to load suppliers');
            } finally {
                setIsInitialLoading(false);
            }
        };
        loadSuppliers();
    }, []);

    // Fetch ledger data for the selected supplier
    const fetchLedger = useCallback(async (supplierId: string) => {
        if (!supplierId) {
            setLedgerData(null);
            return;
        }
        try {
            setIsLoading(true);
            const res = await fetchAPI(`/report/supplier-ledger/${supplierId}`);
            setLedgerData(res.data);
        } catch (error) {
            console.error('Ledger fetch error:', error);
            toast.error('Failed to load ledger data');
            setLedgerData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Trigger fetch when selection changes
    useEffect(() => {
        if (selectedSupplierId) {
            fetchLedger(selectedSupplierId);
        } else {
            setLedgerData(null);
        }
    }, [selectedSupplierId, fetchLedger]);

    const handleSupplierChange = useCallback((id: string) => {
        setSelectedSupplierId(id);
    }, []);

    if (isInitialLoading) {
        return (
            <div className="p-12 text-center text-slate-500 animate-pulse">
                <div className="inline-block p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-medium">Initializing supplier records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <SupplierLedgerHeader
                suppliers={suppliers}
                selectedSupplierId={selectedSupplierId}
                onSupplierChange={handleSupplierChange}
                hasLedgerData={!!ledgerData}
            />

            {!selectedSupplierId ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-full">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose a Supplier</h3>
                        <p className="text-slate-500 text-sm mt-1">Select a supplier from the list above to view their transactional history and account balance.</p>
                    </div>
                </div>
            ) : isLoading ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                    <p className="font-medium">Fetching ledger records...</p>
                </div>
            ) : ledgerData ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <SupplierLedgerSummary
                        summary={ledgerData.summary}
                        formatPrice={formatPrice}
                    />

                    <SupplierLedgerTable
                        transactions={ledgerData.ledger}
                        formatPrice={formatPrice}
                        supplierInfo={ledgerData.supplier}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default SupplierLedgerDashboard;
