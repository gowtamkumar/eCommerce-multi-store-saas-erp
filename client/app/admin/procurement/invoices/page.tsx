'use client';

import React from 'react';
import { useSupplierInvoiceDashboard } from '@/features/admin/procurement/hooks/useSupplierInvoiceDashboard';
import SupplierInvoiceListPage from '@/features/admin/procurement/components/SupplierInvoiceListPage';
import SupplierInvoiceDetailDrawer from '@/features/admin/procurement/components/SupplierInvoiceDetailDrawer';
import ReceiveInvoiceModal from '@/features/admin/procurement/components/ReceiveInvoiceModal';
import RecordPaymentModal from '@/features/admin/procurement/components/RecordPaymentModal';

export default function SupplierInvoicePage() {
  const {
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
  } = useSupplierInvoiceDashboard();

  return (
    <>
      <SupplierInvoiceListPage
        invoices={invoices}
        loading={loading}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSelectInvoice={setSelectedInvoice}
        onOpenCreateModal={() => setCreateOpen(true)}
      />

      <SupplierInvoiceDetailDrawer
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onOpenPayModal={() => setPayOpen(true)}
      />

      <ReceiveInvoiceModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchInvoices}
      />

      <RecordPaymentModal
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        invoice={selectedInvoice}
        onSuccess={fetchInvoices}
      />
    </>
  );
}

