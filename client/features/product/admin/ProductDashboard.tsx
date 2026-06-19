'use client';

import ConfirmModal from '@/components/shared/ConfirmModal';
import ProductList from './ProductList';
import ProductImportModal from './ProductImportModal';
import { useProductCatalog } from './hooks/useProductCatalog';
import { useState } from 'react';

export default function ProductDashboard() {
    const [importOpen, setImportOpen] = useState(false);
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
        refresh,
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
                onOpenImport={() => setImportOpen(true)}
            />

            <ProductImportModal
                isOpen={importOpen}
                onClose={() => setImportOpen(false)}
                onSuccess={() => refresh(pagination.page)}
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
