'use client';

import { useSettings } from '@/hooks/SettingsContext';
import React from 'react';
import { useSupplierLedger } from '../../hooks/useSupplierLedger';
import SupplierLedgerHeader from './SupplierLedgerHeader';
import {
    SupplierLedgerEmpty,
    SupplierLedgerInitializing,
    SupplierLedgerLoading,
} from './SupplierLedgerStates';
import SupplierLedgerSummary from './SupplierLedgerSummary';
import SupplierLedgerTable from './SupplierLedgerTable';

const SupplierLedgerDashboard: React.FC = () => {
    const { formatPrice } = useSettings();
    const {
        suppliers,
        selectedSupplierId,
        ledgerData,
        isLoading,
        isInitialLoading,
        isExporting,
        handleSupplierChange,
        handleExportCsv,
    } = useSupplierLedger();

    if (isInitialLoading) {
        return <SupplierLedgerInitializing />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <SupplierLedgerHeader
                suppliers={suppliers}
                selectedSupplierId={selectedSupplierId}
                onSupplierChange={handleSupplierChange}
                hasLedgerData={!!ledgerData}
                onExportCsv={handleExportCsv}
                isExporting={isExporting}
            />

            {!selectedSupplierId ? (
                <SupplierLedgerEmpty />
            ) : isLoading ? (
                <SupplierLedgerLoading />
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
