'use client';

import React from 'react';
import { useOrders } from '../hooks/useOrders';
import OrderList from './OrderList';
import CourierModal from './CourierModal';

export default function Order() {
    const {
        orders,
        loading,
        searchQuery,
        setSearchQuery,
        selectedCourier,
        showCourierModal,
        pendingCourierOrder,
        statusFilter,
        setStatusFilter,
        sourceFilter,
        setSourceFilter,
        paymentFilter,
        setPaymentFilter,
        sortBy,
        sortOrder,
        selectedIds,
        bulkUpdating,
        pageSize,
        setPageSize,
        pagination,
        handlePageChange,
        handleSortChange,
        handleClearFilters,
        handleToggleRow,
        handleToggleAll,
        handleStatusChange,
        isCreatingCourierOrder,
        handleCourierSelect,
        handleConfirmCourierOrder,
        handleCancelCourierOrder,
        handleExportCSV,
        handleBulkStatusChange,
        handleClearSelection,
    } = useOrders();

    return (
        <>
            <OrderList
                orders={orders}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}

                // Filters
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sourceFilter={sourceFilter}
                onSourceFilterChange={setSourceFilter}
                paymentFilter={paymentFilter}
                onPaymentFilterChange={setPaymentFilter}
                onClearFilters={handleClearFilters}

                onExportCSV={handleExportCSV}
                pagination={pagination}
                onPageChange={handlePageChange}
                onStatusChange={handleStatusChange}
                onCourierSelect={handleCourierSelect}
                selectedCourier={selectedCourier}
                isCreatingCourierOrder={isCreatingCourierOrder}

                // Sorting
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}

                // Bulk selection
                selectedIds={selectedIds}
                onToggleRow={handleToggleRow}
                onToggleAll={handleToggleAll}
                onClearSelection={handleClearSelection}
                onBulkStatusChange={handleBulkStatusChange}
                bulkUpdating={bulkUpdating}

                // Page size
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
            />

            <CourierModal
                isOpen={showCourierModal}
                onClose={handleCancelCourierOrder}
                onConfirm={handleConfirmCourierOrder}
                pendingOrder={pendingCourierOrder}
                isCreating={pendingCourierOrder ? isCreatingCourierOrder(pendingCourierOrder.order.id) : false}
            />
        </>
    );
}
