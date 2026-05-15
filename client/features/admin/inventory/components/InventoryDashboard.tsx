'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { FilterType, ProductStock, VariantStock, InventoryStats } from '../type';
import InventoryStockList from './InventoryStockList';

// Lazy load the adjustment modal to optimize performance
const StockAdjustmentModal = dynamic(() => import('./StockAdjustmentModal'), {
    loading: () => null,
});

export default function InventoryDashboard() {
    const [products, setProducts] = useState<ProductStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    
    // Modal State
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [selectedAdjustmentProduct, setSelectedAdjustmentProduct] = useState<ProductStock | null>(null);
    const [selectedAdjustmentVariant, setSelectedAdjustmentVariant] = useState<VariantStock | null>(null);
    
    const { formatPrice } = useSettings();

    /**
     * Fetches current stock summary from the API
     */
    const fetchStock = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/inventory-ledger/stock-summary');
            if (res.success) {
                setProducts(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch stock summary', error);
            toast.error('Failed to load stock data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    /**
     * Handlers
     */
    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleAdjustProduct = useCallback((p: ProductStock) => {
        setSelectedAdjustmentProduct(p);
        setSelectedAdjustmentVariant(null);
        setIsAdjustmentModalOpen(true);
    }, []);

    const handleAdjustVariant = useCallback((p: ProductStock, v: VariantStock) => {
        setSelectedAdjustmentProduct(p);
        setSelectedAdjustmentVariant(v);
        setIsAdjustmentModalOpen(true);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    const handleFilterChange = useCallback((newFilter: FilterType) => {
        setFilter(newFilter);
    }, []);

    /**
     * Memoized Derived Data
     */
    const filtered = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(query) ||
                p.categoryName?.toLowerCase().includes(query) ||
                p.supplierName?.toLowerCase().includes(query) ||
                p.variants?.some(v => v.sku.toLowerCase().includes(query));

            const matchesFilter =
                filter === 'all' ||
                (filter === 'lowStock' && p.lowStock) ||
                (filter === 'outOfStock' && p.outOfStock) ||
                (filter === 'inStock' && !p.lowStock && !p.outOfStock);
            
            return matchesSearch && matchesFilter;
        });
    }, [products, searchQuery, filter]);

    const stats = useMemo<InventoryStats>(() => {
        const totalValue = products.reduce((s, p) => s + p.stockValue, 0);
        const outOfStockCount = products.filter(p => p.outOfStock).length;
        const lowStockCount = products.filter(p => p.lowStock).length;
        const inStockCount = products.filter(p => !p.lowStock && !p.outOfStock).length;

        return {
            totalProducts: products.length,
            totalValue,
            outOfStockCount,
            lowStockCount,
            inStockCount
        };
    }, [products]);

    return (
        <>
            <InventoryStockList
                products={products}
                filteredProducts={filtered}
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
                    onClose={() => {
                        setIsAdjustmentModalOpen(false);
                        setSelectedAdjustmentProduct(null);
                        setSelectedAdjustmentVariant(null);
                    }}
                    onSuccess={fetchStock}
                />
            )}
        </>
    );
}
