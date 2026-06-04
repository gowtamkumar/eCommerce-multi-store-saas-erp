'use client';

import { usePurchaseOrderDashboard } from '../hooks/usePurchaseOrderDashboard';
import PurchaseOrderList from './PurchaseOrderList';

export default function PurchaseOrderDashboard() {
    const {
        orders,
        loading,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        pagination,
        debouncedSearch,
        handleReceive,
        handlePageChange,
    } = usePurchaseOrderDashboard();

    return (
        <PurchaseOrderList
            orders={orders}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            pagination={pagination}
            onPageChange={handlePageChange}
            onReceive={handleReceive}
            isSearchLoading={debouncedSearch !== searchQuery}
        />
    );
}
