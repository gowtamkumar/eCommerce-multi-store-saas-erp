'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';

export interface TransferLine {
    productId: string;
    productName: string;
    variantId?: string;
    variantLabel?: string;
    quantityRequested: number;
    quantityReceived?: number;
}

export interface StockTransferDoc {
    id: string;
    transferNumber: string;
    sourceWarehouseId: string;
    sourceWarehouse?: { name: string; code: string };
    destinationWarehouseId: string;
    destinationWarehouse?: { name: string; code: string };
    status: 'DRAFT' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';
    remarks: string | null;
    createdAt: string;
    user?: { username: string };
    items?: Array<{
        id: string;
        productId: string;
        product?: { name: string; images?: string[] };
        variantId?: string;
        variant?: { combination: Record<string, string> };
        quantityRequested: number;
        quantityReceived: number;
    }>;
}

export function useStockTransfer() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<StockTransferDoc[]>([]);
    const [totalTransfers, setTotalTransfers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // List navigation & filters
    const [activeTab, setActiveTab] = useState<'LIST' | 'NEW'>('LIST');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Creation form state
    const [sourceId, setSourceId] = useState('');
    const [destId, setDestId] = useState('');
    const [remarks, setRemarks] = useState('');
    const [newLines, setNewLines] = useState<TransferLine[]>([]);

    // Detail modal state
    const [selectedTransfer, setSelectedTransfer] = useState<StockTransferDoc | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Receive modal/form state
    const [receiveOpen, setReceiveOpen] = useState(false);
    const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>({});

    // Product picker state
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');

    const loadBaseData = useCallback(async () => {
        setLoading(true);
        try {
            const [wRes, pRes] = await Promise.all([
                fetchAPI('/system/warehouses'),
                fetchAPI('/products?limit=100&status=active'),
            ]);
            if (wRes.success) setWarehouses(wRes.data || []);
            if (pRes.success) setProducts(pRes.data?.products || pRes.data || []);
        } catch {
            toast.error('Failed to load warehouses or products');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadTransfers = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            params.set('page', String(currentPage));
            params.set('limit', '10');
            if (statusFilter) params.set('status', statusFilter);
            if (searchQuery.trim()) params.set('q', searchQuery.trim());
            const res = await fetchAPI(`/stock-transfers?${params.toString()}`);
            if (res.success) {
                setTransfers(res.data?.items || []);
                setTotalTransfers(res.data?.total || 0);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load stock transfers');
        }
    }, [currentPage, statusFilter, searchQuery]);

    const loadDetail = useCallback(async (id: string) => {
        setDetailsLoading(true);
        try {
            const res = await fetchAPI(`/stock-transfers/${id}`);
            if (res.success) {
                setSelectedTransfer(res.data);
                // Initialize receive quantities mapping
                const qtys: Record<string, number> = {};
                res.data.items?.forEach((item: any) => {
                    qtys[item.id] = Number(item.quantityRequested);
                });
                setReceiveQtys(qtys);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to fetch details');
        } finally {
            setDetailsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBaseData();
    }, [loadBaseData]);

    useEffect(() => {
        if (activeTab === 'LIST') {
            loadTransfers();
        }
    }, [activeTab, currentPage, statusFilter, searchQuery, loadTransfers]);

    const addLine = useCallback((product: any, variant?: any) => {
        const exists = newLines.find(
            l => l.productId === product.id && l.variantId === (variant?.id || undefined)
        );
        if (exists) {
            toast('This product/variant is already in the transfer list.');
            return;
        }
        setNewLines(prev => [
            ...prev,
            {
                productId: product.id,
                productName: product.name,
                variantId: variant?.id,
                variantLabel: variant
                    ? Object.entries(variant.combination || {}).map(([k, v]) => `${k}: ${v}`).join(' / ')
                    : undefined,
                quantityRequested: 1,
            },
        ]);
        setPickerOpen(false);
        setPickerSearch('');
    }, [newLines]);

    const updateQty = useCallback((idx: number, val: number) => {
        setNewLines(prev => prev.map((l, i) => i === idx ? { ...l, quantityRequested: Math.max(1, val) } : l));
    }, []);

    const removeLine = useCallback((idx: number) => {
        setNewLines(prev => prev.filter((_, i) => i !== idx));
    }, []);

    const handleCreateTransfer = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceId || !destId) { toast.error('Select source and destination warehouses'); return; }
        if (sourceId === destId) { toast.error('Source and destination must differ'); return; }
        if (newLines.length === 0) { toast.error('Add at least one product line'); return; }

        setSubmitting(true);
        try {
            const res = await fetchAPI('/stock-transfers', {
                method: 'POST',
                body: JSON.stringify({
                    sourceWarehouseId: sourceId,
                    destinationWarehouseId: destId,
                    remarks: remarks || undefined,
                    items: newLines.map(l => ({
                        productId: l.productId,
                        variantId: l.variantId || undefined,
                        quantityRequested: l.quantityRequested,
                    })),
                }),
            });

            if (res.success) {
                toast.success('Stock transfer document created successfully');
                setNewLines([]);
                setSourceId('');
                setDestId('');
                setRemarks('');
                setActiveTab('LIST');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Creation failed');
        } finally {
            setSubmitting(false);
        }
    }, [sourceId, destId, remarks, newLines]);

    const handleApprove = useCallback(async (id: string) => {
        try {
            const res = await fetchAPI(`/stock-transfers/${id}/approve`, { method: 'POST' });
            if (res.success) {
                toast.success('Stock transfer document approved');
                loadDetail(id);
                loadTransfers();
            }
        } catch (err: any) {
            toast.error(err?.message || 'Approval failed');
        }
    }, [loadDetail, loadTransfers]);

    const handleShip = useCallback(async (id: string) => {
        try {
            const res = await fetchAPI(`/stock-transfers/${id}/ship`, { method: 'POST' });
            if (res.success) {
                toast.success('Stock transfer dispatched & stock deducted from origin');
                loadDetail(id);
                loadTransfers();
            }
        } catch (err: any) {
            toast.error(err?.message || 'Dispatch failed');
        }
    }, [loadDetail, loadTransfers]);

    const handleReceive = useCallback(async (id: string) => {
        try {
            const items = Object.entries(receiveQtys).map(([itemId, quantityReceived]) => ({
                itemId,
                quantityReceived,
            }));

            const res = await fetchAPI(`/stock-transfers/${id}/receive`, {
                method: 'POST',
                body: JSON.stringify({ items }),
            });

            if (res.success) {
                toast.success('Stock transfer received & stock added to destination');
                setReceiveOpen(false);
                loadDetail(id);
                loadTransfers();
            }
        } catch (err: any) {
            toast.error(err?.message || 'Receipt failed');
        }
    }, [receiveQtys, loadDetail, loadTransfers]);

    const handleCancel = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to cancel this stock transfer? This will reverse any stock deductions if already in transit.')) {
            return;
        }
        try {
            const res = await fetchAPI(`/stock-transfers/${id}/cancel`, { method: 'POST' });
            if (res.success) {
                toast.success('Stock transfer cancelled successfully');
                loadDetail(id);
                loadTransfers();
            }
        } catch (err: any) {
            toast.error(err?.message || 'Cancellation failed');
        }
    }, [loadDetail, loadTransfers]);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
            p.slug?.toLowerCase().includes(pickerSearch.toLowerCase())
        );
    }, [products, pickerSearch]);

    const filteredTransfers = useMemo(() => {
        return transfers.filter(t =>
            t.transferNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.remarks && t.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [transfers, searchQuery]);

    return {
        warehouses,
        products,
        transfers: filteredTransfers,
        rawTransfers: transfers,
        totalTransfers,
        loading,
        submitting,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        currentPage,
        setCurrentPage,
        sourceId,
        setSourceId,
        destId,
        setDestId,
        remarks,
        setRemarks,
        newLines,
        setNewLines,
        selectedTransfer,
        setSelectedTransfer,
        detailsLoading,
        receiveOpen,
        setReceiveOpen,
        receiveQtys,
        setReceiveQtys,
        pickerOpen,
        setPickerOpen,
        pickerSearch,
        setPickerSearch,
        filteredProducts,
        loadBaseData,
        loadTransfers,
        loadDetail,
        addLine,
        updateQty,
        removeLine,
        handleCreateTransfer,
        handleApprove,
        handleShip,
        handleReceive,
        handleCancel,
    };
}
