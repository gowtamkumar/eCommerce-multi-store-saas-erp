'use client';

import type { BatchPaymentResult, UnpaidInvoice } from '../../types';
import BatchInvoiceList from './BatchInvoiceList';
import BatchPaymentForm from './BatchPaymentForm';
import PaymentRunReceipt from './PaymentRunReceipt';

export interface ApBatchPaymentViewProps {
    filteredInvoices: UnpaidInvoice[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    selectedInvoiceIds: string[];
    hasInvoices: boolean;
    allSelected: boolean;
    onToggleInvoice: (id: string) => void;
    onToggleSelectAll: () => void;
    selectedPaymentTotal: number;
    paymentMethod: string;
    transactionId: string;
    paymentNote: string;
    processing: boolean;
    onPaymentMethodChange: (value: string) => void;
    onTransactionIdChange: (value: string) => void;
    onPaymentNoteChange: (value: string) => void;
    onSubmit: () => void;
    paymentRunResult: BatchPaymentResult | null;
    onRemindBatch: () => void;
}

export default function ApBatchPaymentView({
    filteredInvoices,
    loading,
    search,
    onSearchChange,
    selectedInvoiceIds,
    hasInvoices,
    allSelected,
    onToggleInvoice,
    onToggleSelectAll,
    selectedPaymentTotal,
    paymentMethod,
    transactionId,
    paymentNote,
    processing,
    onPaymentMethodChange,
    onTransactionIdChange,
    onPaymentNoteChange,
    onSubmit,
    paymentRunResult,
    onRemindBatch,
}: ApBatchPaymentViewProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <BatchInvoiceList
                filteredInvoices={filteredInvoices}
                loading={loading}
                search={search}
                onSearchChange={onSearchChange}
                selectedInvoiceIds={selectedInvoiceIds}
                hasInvoices={hasInvoices}
                allSelected={allSelected}
                onToggleInvoice={onToggleInvoice}
                onToggleSelectAll={onToggleSelectAll}
            />

            <div className="space-y-6">
                <BatchPaymentForm
                    selectedCount={selectedInvoiceIds.length}
                    selectedPaymentTotal={selectedPaymentTotal}
                    paymentMethod={paymentMethod}
                    transactionId={transactionId}
                    paymentNote={paymentNote}
                    processing={processing}
                    onPaymentMethodChange={onPaymentMethodChange}
                    onTransactionIdChange={onTransactionIdChange}
                    onPaymentNoteChange={onPaymentNoteChange}
                    onSubmit={onSubmit}
                    onRemindBatch={onRemindBatch}
                />

                {paymentRunResult && <PaymentRunReceipt result={paymentRunResult} />}
            </div>
        </div>
    );
}
