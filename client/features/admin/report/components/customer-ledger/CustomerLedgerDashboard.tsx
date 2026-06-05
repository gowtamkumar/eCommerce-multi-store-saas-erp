'use client';

import { useSettings } from '@/hooks/SettingsContext';
import React from 'react';
import { useCustomerLedger } from '../../hooks/useCustomerLedger';
import CustomerLedgerHeader from './CustomerLedgerHeader';
import {
    CustomerLedgerEmpty,
    CustomerLedgerInitializing,
    CustomerLedgerLoading,
} from './CustomerLedgerStates';
import CustomerLedgerSummary from './CustomerLedgerSummary';
import CustomerLedgerTable from './CustomerLedgerTable';

const CustomerLedgerDashboard: React.FC = () => {
    const { formatPrice } = useSettings();
    const {
        customers,
        selectedCustomerId,
        ledgerData,
        isLoading,
        isInitialLoading,
        isExporting,
        handleCustomerChange,
        handleExportCsv,
    } = useCustomerLedger();

    if (isInitialLoading) {
        return <CustomerLedgerInitializing />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <CustomerLedgerHeader
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                onCustomerChange={handleCustomerChange}
                hasLedgerData={!!ledgerData}
                onExportCsv={handleExportCsv}
                isExporting={isExporting}
            />

            {!selectedCustomerId ? (
                <CustomerLedgerEmpty />
            ) : isLoading ? (
                <CustomerLedgerLoading />
            ) : ledgerData ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <CustomerLedgerSummary
                        summary={ledgerData.summary}
                        formatPrice={formatPrice}
                    />

                    <CustomerLedgerTable
                        transactions={ledgerData.ledger}
                        formatPrice={formatPrice}
                        customerInfo={ledgerData.customer}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default CustomerLedgerDashboard;
