'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
    aggregateStockResults,
    computeStockStats,
    filterStockProducts,
    filterWarehousesByBranch,
    selectTargetWarehouses,
} from '../lib/warehouseStock';
import { buildStockReportCsv, buildStockReportFilename, downloadCsv } from '../lib/warehouseStockCsv';
import type {
    WarehouseBranchRef,
    WarehouseStockFilter,
    WarehouseStockProduct,
    WarehouseStockTableRow,
} from '../types';

export function useWarehouseStockReport() {
    const [branches, setBranches] = useState<WarehouseBranchRef[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseBranchRef[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [selectedWarehouseId, setSelectedWarehouseId] = useState('all');
    const [products, setProducts] = useState<WarehouseStockProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<WarehouseStockFilter>('all');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const initFilterData = async () => {
            try {
                setLoading(true);
                const [whRes, brRes] = await Promise.all([
                    fetchAPI('/system/warehouses'),
                    fetchAPI('/system/branches'),
                ]);
                setWarehouses(whRes.success ? (whRes.data || []) : []);
                setBranches(brRes.success ? (brRes.data || []) : []);
                setSelectedWarehouseId('all');
            } catch (error) {
                console.error('Failed to load initial filters data', error);
                toast.error('Failed to load branch or warehouse filters');
            } finally {
                setLoading(false);
            }
        };
        void initFilterData();
    }, []);

    const filteredWarehouses = useMemo(
        () => filterWarehousesByBranch(warehouses, selectedBranchId),
        [warehouses, selectedBranchId],
    );

    const handleBranchChange = useCallback((branchId: string) => {
        setSelectedBranchId(branchId);
        setSelectedWarehouseId('all');
    }, []);

    const fetchStockReport = useCallback(async () => {
        if (warehouses.length === 0) return;
        setLoading(true);
        try {
            const targetWarehouses = selectTargetWarehouses(warehouses, selectedBranchId, selectedWarehouseId);

            if (targetWarehouses.length === 0) {
                setProducts([]);
                return;
            }

            const results = await Promise.all(
                targetWarehouses.map((w) =>
                    fetchAPI(`/inventory-ledger/stock-summary?warehouseId=${w.id}`)
                        .then((res) => ({ warehouseId: w.id, data: res.success ? (res.data || []) : [] }))
                        .catch(() => ({ warehouseId: w.id, data: [] as WarehouseStockProduct[] })),
                ),
            );

            if (targetWarehouses.length === 1) {
                setProducts(results[0].data);
                return;
            }

            setProducts(aggregateStockResults(results));
        } catch (error) {
            console.error('Failed to load stock reports data', error);
            toast.error('Failed to load stock reports data');
        } finally {
            setLoading(false);
        }
    }, [selectedBranchId, selectedWarehouseId, warehouses]);

    useEffect(() => {
        void fetchStockReport();
    }, [fetchStockReport]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const filteredProducts = useMemo(
        () => filterStockProducts(products, searchQuery, filter),
        [products, searchQuery, filter],
    );

    const stats = useMemo(() => computeStockStats(filteredProducts), [filteredProducts]);

    const tableData = useMemo<WarehouseStockTableRow[]>(() => {
        const rows: WarehouseStockTableRow[] = [];
        filteredProducts.forEach((p) => {
            rows.push({ ...p, isParent: true });
            if (p.hasVariants && expandedIds.has(p.id)) {
                p.variants?.forEach((v) => {
                    rows.push({ ...v, isVariant: true, parentProduct: p });
                });
            }
        });
        return rows;
    }, [filteredProducts, expandedIds]);

    const filterCounts = useMemo(() => ([
        { key: 'all' as const, label: 'All Products', count: products.length },
        { key: 'inStock' as const, label: 'In Stock', count: products.filter((p) => !p.lowStock && !p.outOfStock).length },
        { key: 'lowStock' as const, label: 'Low Stock', count: products.filter((p) => p.lowStock).length },
        { key: 'outOfStock' as const, label: 'Out of Stock', count: products.filter((p) => p.outOfStock).length },
    ]), [products]);

    const exportCsv = useCallback((currencyCode?: string) => {
        try {
            const branchName = selectedBranchId
                ? (branches.find((b) => b.id === selectedBranchId)?.name || 'Branch')
                : 'Global';
            const warehouseName = selectedWarehouseId === 'all'
                ? 'All-Warehouses'
                : (warehouses.find((w) => w.id === selectedWarehouseId)?.name || 'Warehouse');

            const csv = buildStockReportCsv(filteredProducts, currencyCode);
            downloadCsv(csv, buildStockReportFilename(branchName, warehouseName));
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Failed to export CSV', error);
            toast.error('Failed to export CSV');
        }
    }, [branches, warehouses, selectedBranchId, selectedWarehouseId, filteredProducts]);

    return {
        branches,
        filteredWarehouses,
        selectedBranchId,
        selectedWarehouseId,
        products,
        filteredProducts,
        tableData,
        stats,
        filterCounts,
        loading,
        searchQuery,
        filter,
        expandedIds,
        setSearchQuery,
        setFilter,
        setSelectedWarehouseId,
        handleBranchChange,
        toggleExpand,
        exportCsv,
    };
}
