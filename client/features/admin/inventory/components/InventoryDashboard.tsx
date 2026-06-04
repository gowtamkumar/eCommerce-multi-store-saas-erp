'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSettings } from '@/hooks/SettingsContext';
import { useInventoryDashboard } from '../hooks/useInventoryDashboard';
import InventoryStockList from './InventoryStockList';

// Lazy load the adjustment modal to optimize performance
const StockAdjustmentModal = dynamic(() => import('./StockAdjustmentModal'), {
    loading: () => null,
});

export default function InventoryDashboard() {
    const { formatPrice } = useSettings();
    const {
        products,
        filteredProducts,
        loading,
        searchQuery,
        filter,
        expandedIds,
        isAdjustmentModalOpen,
        selectedAdjustmentProduct,
        selectedAdjustmentVariant,
        stats,
        fetchStock,
        toggleExpand,
        handleAdjustProduct,
        handleAdjustVariant,
        handleSearchChange,
        handleFilterChange,
        handleCloseAdjustmentModal,
    } = useInventoryDashboard();

    return (
        <>
            <InventoryStockList
                products={products}
                filteredProducts={filteredProducts}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                filter={filter}
                onFilterChange={handleFilterChange}
                stats={stats}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                onAdjustProduct={handleAdjustProduct}
                onAdjustVariant={handleAdjustVariant}
                formatPrice={formatPrice}
            />

            {/* Adjustment Modal is lazy-loaded */}
            {isAdjustmentModalOpen && (
                <StockAdjustmentModal
                    isOpen={isAdjustmentModalOpen}
                    initialProduct={selectedAdjustmentProduct}
                    initialVariant={selectedAdjustmentVariant}
                    onClose={handleCloseAdjustmentModal}
                    onSuccess={fetchStock}
                />
            )}
        </>
    );
}
