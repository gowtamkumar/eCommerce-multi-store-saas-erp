'use client';

import React from 'react';
import { usePaymentsDashboard } from '@/features/admin/payments/hooks/usePaymentsDashboard';
import { PaymentsListPage } from '@/features/admin/payments/components/PaymentsListPage';

export default function PaymentsPageShell() {
  const {
    payments,
    loading,
    searchQuery,
    setSearchQuery,
    pagination,
    handlePageChange,
  } = usePaymentsDashboard();

  return (
    <PaymentsListPage
      payments={payments}
      loading={loading}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
}