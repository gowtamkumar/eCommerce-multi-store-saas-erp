'use client';

import ConfirmModal from '@/components/shared/ConfirmModal';
import ProductList from './ProductList';
import { useProductCatalog } from './hooks/useProductCatalog';

export default function ProductDashboard() {
    const {
        products,
        loading,
        searchQuery,
        statusFilter,
        filterLowStock,
        sortBy,
        sortOrder,
        pagination,
        confirmModal,
        setConfirmModal,
        handleSearchChange,
        handleStatusFilterChange,
        handleLowStockToggle,
        handleSortChange,
        handlePageChange,
        handleDelete,
        handleStatusUpdate,
        handleLandingPage,
    } = useProductCatalog();

    return (
        <>
            <ProductList
                products={products}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                filterLowStock={filterLowStock}
                onLowStockToggle={handleLowStockToggle}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                pagination={pagination}
                onPageChange={handlePageChange}
                onDelete={handleDelete}
                onStatusChange={handleStatusUpdate}
                onLandingPage={handleLandingPage}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                // Provide a callback that updates the modal state when the user closes it
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                // Provide default button texts to avoid undefined props
                confirmText="Confirm"
                cancelText="Cancel"
                isDangerous={confirmModal.isDangerous}
            />
        </>
    );
}
