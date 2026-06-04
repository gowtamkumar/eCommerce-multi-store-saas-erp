'use client';

import { useApDashboard } from '../hooks/useApDashboard';
import ApHeader from './ap/ApHeader';
import ApTabs from './ap/ApTabs';
import ApAgingDashboard from './ap/ApAgingDashboard';
import ApBatchPaymentView from './ap/ApBatchPaymentView';

export default function ApAgingReport() {
    const ap = useApDashboard();

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
                />
            )}
        </div>
    );
}
