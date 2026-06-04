'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { ProductStock, VariantStock, FilterType, InventoryStats } from '../type';

export function useInventoryDashboard() {
    const [products, setProducts] = useState<ProductStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Modal State
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [selectedAdjustmentProduct, setSelectedAdjustmentProduct] = useState<ProductStock | null>(null);
    const [selectedAdjustmentVariant, setSelectedAdjustmentVariant] = useState<VariantStock | null>(null);

    const fetchStock = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/inventory-ledger/stock-summary');
            if (res.success) {
                setProducts(res.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch stock summary', error);
            toast.error('Failed to load stock data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
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

    const handleCloseAdjustmentModal = useCallback(() => {
        setIsAdjustmentModalOpen(false);
        setSelectedAdjustmentProduct(null);
        setSelectedAdjustmentVariant(null);
    }, []);

    const filtered = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(query) ||
                (p.categoryName || '').toLowerCase().includes(query) ||
                (p.supplierName || '').toLowerCase().includes(query) ||
                (p.variants || []).some(v => (v.sku || '').toLowerCase().includes(query));

            const matchesFilter =
                filter === 'all' ||
                (filter === 'lowStock' && p.lowStock) ||
                (filter === 'outOfStock' && p.outOfStock) ||
                (filter === 'inStock' && !p.lowStock && !p.outOfStock);

            return matchesSearch && matchesFilter;
        });
    }, [products, searchQuery, filter]);

    const stats = useMemo<InventoryStats>(() => {
        const totalValue = products.reduce((s, p) => s + (p.stockValue || 0), 0);
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

    return {
        products,
        filteredProducts: filtered,
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
    };
}
