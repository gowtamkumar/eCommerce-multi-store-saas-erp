'use client';

import GrnListPage from '@/features/admin/grn/components/GrnListPage';
import { useGrnList } from '@/features/admin/grn/hooks/useGrnList';

export default function GrnsPage() {
  const {
    grns,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    pagination,
    handlePageChange,
  } = useGrnList();

  return (
    <GrnListPage
      grns={grns}
      loading={loading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
}

