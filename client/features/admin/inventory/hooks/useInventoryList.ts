'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';

export interface InventoryTransaction {
    id: string;
    createdAt: string;
    type: string;
    quantity: number;
    balanceAfter: number;
    referenceType?: string;
    referenceId?: string;
    product?: {
        name?: string;
    };
    variant?: {
        combination?: Record<string, string>;
    };
    warehouse?: {
        name?: string;
    };
}

export interface WarehouseOption {
    id: string;
    name: string;
}

export function useInventoryList() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchWarehouses = useCallback(async () => {
        try {
            const res = await fetchAPI('/system/warehouses');
            if (res.success) {
                setWarehouses(res.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch warehouses', error);
        }
    }, []);

    const fetchTransactions = useCallback(async (page: number, search: string, type: string, warehouseId: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { q: search }),
                ...(type && { type }),
                ...(warehouseId && { warehouseId })
            });

            const res = await fetchAPI(`/inventory-ledger?${params}`);
            if (res.success && res.data) {
                setTransactions(res.data.items || []);
                setPagination({
                    page: res.data.page || 1,
                    limit: res.data.limit || 10,
                    total: res.data.total || 0,
                    totalPages: res.data.totalPages || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
            toast.error('Failed to load inventory transactions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    useEffect(() => {
        fetchTransactions(1, debouncedSearch, typeFilter, warehouseFilter);
    }, [debouncedSearch, typeFilter, warehouseFilter, fetchTransactions]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchTransactions(newPage, debouncedSearch, typeFilter, warehouseFilter);
        }
    }, [debouncedSearch, typeFilter, warehouseFilter, pagination.totalPages, fetchTransactions]);

    const handleOpenAdjustmentModal = useCallback(() => {
        setIsAdjustmentModalOpen(true);
    }, []);

    const handleCloseAdjustmentModal = useCallback(() => {
        setIsAdjustmentModalOpen(false);
    }, []);

    const handleRefresh = useCallback(() => {
        fetchTransactions(1, debouncedSearch, typeFilter, warehouseFilter);
    }, [debouncedSearch, typeFilter, warehouseFilter, fetchTransactions]);

    return {
        transactions,
        loading,
        searchQuery,
        setSearchQuery,
        typeFilter,
        setTypeFilter,
        warehouseFilter,
        setWarehouseFilter,
        warehouses,
        isAdjustmentModalOpen,
        pagination,
        handlePageChange,
        handleOpenAdjustmentModal,
        handleCloseAdjustmentModal,
        handleRefresh,
    };
}
