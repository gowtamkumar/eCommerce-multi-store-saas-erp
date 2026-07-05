'use client';

import { useMemo } from 'react';
import { useApDashboard } from '../hooks/useApDashboard';
import {
    buildBatchApReminderContext,
    buildSupplierApReminderContext,
    getApOverdueAmount,
    getOldestApAgingBucket,
} from '../lib/buildApPaymentReminderContext';
import ApAgingDashboard from './ap/ApAgingDashboard';
import ApBatchPaymentView from './ap/ApBatchPaymentView';
import ApHeader from './ap/ApHeader';
import ApPaymentReminderModal from './ap/ApPaymentReminderModal';
import ApTabs from './ap/ApTabs';

export default function ApAgingReport() {
    const ap = useApDashboard();

    const reminderModalProps = useMemo(() => {
        if (!ap.reminderTarget) return null;

        if (ap.reminderTarget.type === 'supplier') {
            const { row, unpaidInvoices } = ap.reminderTarget;
            const payload = buildSupplierApReminderContext(row, unpaidInvoices);

            return {
                title: 'Payment approval reminder',
                subtitle: `${row.supplierName} · ${getOldestApAgingBucket(row)}`,
                apSummary: payload.apSummary,
                invoicesSummary: payload.invoicesSummary,
                hasActionableBalance: getApOverdueAmount(row) > 0,
            };
        }

        const { invoices } = ap.reminderTarget;
        const payload = buildBatchApReminderContext(invoices);
        const totalOutstanding = invoices.reduce(
            (sum, invoice) => sum + (Number(invoice.totalAmount) - Number(invoice.paidAmount || 0)),
            0,
        );

        return {
            title: 'Batch payment approval reminder',
            subtitle: `${invoices.length} invoice${invoices.length === 1 ? '' : 's'} · ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })} outstanding`,
            apSummary: payload.apSummary,
            invoicesSummary: payload.invoicesSummary,
            hasActionableBalance: invoices.length > 0,
        };
    }, [ap.reminderTarget]);

    return (
        <div className="space-y-6 pb-12">
            <ApHeader loading={ap.loading} onRefresh={ap.refresh} />

            <ApTabs activeTab={ap.activeTab} unpaidCount={ap.unpaidCount} onTabChange={ap.setActiveTab} />

            {ap.activeTab === 'aging' ? (
                <ApAgingDashboard
                    agingData={ap.agingData}
                    filteredAging={ap.filteredAging}
                    loading={ap.loading}
                    search={ap.search}
                    onSearchChange={ap.setSearch}
                    totalOutstanding={ap.totalOutstanding}
                    totalOverdue={ap.totalOverdue}
                    onRemind={(row) => void ap.openSupplierReminder(row)}
                />
            ) : (
                <ApBatchPaymentView
                    filteredInvoices={ap.filteredInvoices}
                    loading={ap.loading}
                    search={ap.search}
                    onSearchChange={ap.setSearch}
                    selectedInvoiceIds={ap.selectedInvoiceIds}
                    hasInvoices={ap.unpaidCount > 0}
                    allSelected={ap.allSelected}
                    onToggleInvoice={ap.toggleInvoice}
                    onToggleSelectAll={ap.toggleSelectAll}
                    selectedPaymentTotal={ap.selectedPaymentTotal}
                    paymentMethod={ap.paymentMethod}
                    transactionId={ap.transactionId}
                    paymentNote={ap.paymentNote}
                    processing={ap.processingPayment}
                    onPaymentMethodChange={ap.setPaymentMethod}
                    onTransactionIdChange={ap.setTransactionId}
                    onPaymentNoteChange={ap.setPaymentNote}
                    onSubmit={ap.runBatchPayment}
                    paymentRunResult={ap.paymentRunResult}
                    onRemindBatch={ap.openBatchReminder}
                />
            )}

            {reminderModalProps && (
                <ApPaymentReminderModal
                    {...reminderModalProps}
                    onClose={() => ap.setReminderTarget(null)}
                />
            )}
        </div>
    );
}
