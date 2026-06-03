'use client';

import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeftRight,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Eye,
    FileText,
    Loader2,
    Package,
    Plus,
    Search,
    Trash2,
    Truck,
    Warehouse,
    X
} from 'lucide-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

interface TransferLine {
    productId: string;
    productName: string;
    variantId?: string;
    variantLabel?: string;
    quantityRequested: number;
    quantityReceived?: number;
}

interface StockTransferDoc {
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

export default function StockTransfer() {
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

    useEffect(() => {
        loadBaseData();
    }, []);

    useEffect(() => {
        if (activeTab === 'LIST') {
            loadTransfers();
        }
    }, [activeTab, currentPage, statusFilter, searchQuery]);

    const loadBaseData = async () => {
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
    };

    const loadTransfers = async () => {
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
    };

    const loadDetail = async (id: string) => {
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
    };

    const addLine = (product: any, variant?: any) => {
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
    };

    const updateQty = (idx: number, val: number) => {
        setNewLines(prev => prev.map((l, i) => i === idx ? { ...l, quantityRequested: Math.max(1, val) } : l));
    };

    const removeLine = (idx: number) => {
        setNewLines(prev => prev.filter((_, i) => i !== idx));
    };

    const handleCreateTransfer = async (e: React.FormEvent) => {
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
    };

    const handleApprove = async (id: string) => {
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
    };

    const handleShip = async (id: string) => {
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
    };

    const handleReceive = async (id: string) => {
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
    };

    const handleCancel = async (id: string) => {
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
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            case 'APPROVED': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
            case 'IN_TRANSIT': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
            case 'RECEIVED': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
            case 'CANCELLED': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.slug?.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    const filteredTransfers = transfers.filter(t =>
        t.transferNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.remarks && t.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const columns = useMemo<DataTableColumn<StockTransferDoc>[]>(() => [
        {
            key: 'transferNumber',
            header: 'Transfer Doc',
            className: 'px-6 py-5',
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{item.transferNumber}</p>
                        {item.remarks && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs mt-0.5">{item.remarks}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'route',
            header: 'Route',
            className: 'px-6 py-5',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {item.sourceWarehouse?.name || 'Origin'}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {item.destinationWarehouse?.name || 'Destination'}
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            className: 'px-6 py-5',
            cell: (item) => (
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase ${getStatusStyle(item.status)}`}>
                    {item.status}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created At',
            className: 'px-6 py-5',
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'px-6 py-5 text-right',
            cell: (item) => (
                <button
                    onClick={() => loadDetail(item.id)}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                    <Eye className="w-3.5 h-3.5" />
                    Manage
                </button>
            ),
        },
    ], []);

    const dataTablePagination = useMemo(() => ({
        page: currentPage,
        total: totalTransfers,
        totalPages: Math.ceil(totalTransfers / 10) || 1,
        onPageChange: (p: number) => setCurrentPage(p),
    }), [currentPage, totalTransfers]);

    const dataTablePaginationSummary = useMemo(() => (
        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
            Page {currentPage} of {Math.ceil(totalTransfers / 10) || 1}
        </span>
    ), [currentPage, totalTransfers]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <ArrowLeftRight className="w-6 h-6 text-brand-600" />
                        Multi-Warehouse Stock Documents
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Formal document flow with states to track and audit inventory transfers between warehouses.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('LIST')}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${activeTab === 'LIST'
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        Transfers Registry
                    </button>
                    <button
                        onClick={() => setActiveTab('NEW')}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${activeTab === 'NEW'
                                ? 'bg-brand-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create Transfer
                    </button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                </div>
            )}

            {!loading && activeTab === 'LIST' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by transfer number or remarks..."
                                value={searchQuery}
                                onChange={e => { setCurrentPage(1); setSearchQuery(e.target.value); }}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => { setCurrentPage(1); setStatusFilter(e.target.value); }}
                            className="md:w-48 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                        >
                            <option value="">All statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="APPROVED">Approved</option>
                            <option value="IN_TRANSIT">In transit</option>
                            <option value="RECEIVED">Received</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <DataTable
                        data={filteredTransfers}
                        columns={columns}
                        getRowKey={(item) => item.id}
                        loading={loading}
                        loadingLabel="Loading stock transfers..."
                        emptyLabel="No stock transfer documents found."
                        containerClassName="border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm bg-transparent"
                        rowClassName="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                        pagination={dataTablePagination}
                        paginationSummary={dataTablePaginationSummary}
                    />
                </div>
            )}

            {!loading && activeTab === 'NEW' && (
                <form onSubmit={handleCreateTransfer} className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-5 uppercase tracking-wider">Transfer Route Configuration</h4>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Source Warehouse</label>
                                <div className="relative">
                                    <Warehouse className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={sourceId}
                                        onChange={e => setSourceId(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none font-bold appearance-none"
                                    >
                                        <option value="">Select Origin...</option>
                                        {warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex-shrink-0 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl mt-4 md:mt-5">
                                <ChevronRight className="w-5 h-5 text-brand-600" />
                            </div>

                            <div className="flex-1 w-full">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Destination Warehouse</label>
                                <div className="relative">
                                    <Warehouse className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={destId}
                                        onChange={e => setDestId(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none font-bold appearance-none"
                                    >
                                        <option value="">Select Destination...</option>
                                        {warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Remarks / Reason</label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                placeholder="e.g. Replenishing stock for campaign, moving damageables..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Requested Products ({newLines.length})
                            </h4>
                            <button
                                type="button"
                                onClick={() => setPickerOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/20"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Product
                            </button>
                        </div>

                        {newLines.length === 0 ? (
                            <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center gap-2 text-slate-400">
                                <Package className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                <span className="text-sm">List is empty. Add products to dispatch.</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {newLines.map((line, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl"
                                    >
                                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <Package className="w-4 h-4 text-brand-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{line.productName}</p>
                                            {line.variantLabel && (
                                                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{line.variantLabel}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500">Qty:</span>
                                            <input
                                                type="number"
                                                min={1}
                                                value={line.quantityRequested}
                                                onChange={e => updateQty(idx, Number(e.target.value))}
                                                className="w-20 text-center px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-brand-500"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeLine(idx)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || newLines.length === 0}
                            className="flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            {submitting ? 'Creating Doc...' : 'Create Draft Document'}
                        </button>
                    </div>
                </form>
            )}

            {/* Document details side sheet */}
            <AnimatePresence>
                {selectedTransfer && (
                    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/60 backdrop-blur-sm">
                        <div className="fixed inset-0" onClick={() => setSelectedTransfer(null)} />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-50 border-l border-slate-100 dark:border-slate-800"
                        >
                            {detailsLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                </div>
                            ) : (
                                <>
                                    {/* Sheet Header */}
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl text-brand-600">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 dark:text-white">{selectedTransfer.transferNumber}</h4>
                                                <span className={`inline-block px-2.5 py-1 mt-1 rounded-lg text-[9px] font-black tracking-wider uppercase ${getStatusStyle(selectedTransfer.status)}`}>
                                                    {selectedTransfer.status}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedTransfer(null)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Sheet Body */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {/* Route details */}
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800/50 grid grid-cols-5 items-center text-center">
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Warehouse</p>
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{selectedTransfer.sourceWarehouse?.name}</p>
                                                <span className="text-[10px] font-mono text-slate-400">{selectedTransfer.sourceWarehouse?.code}</span>
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <ChevronRight className="w-5 h-5 text-brand-500" />
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dest Warehouse</p>
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{selectedTransfer.destinationWarehouse?.name}</p>
                                                <span className="text-[10px] font-mono text-slate-400">{selectedTransfer.destinationWarehouse?.code}</span>
                                            </div>
                                        </div>

                                        {selectedTransfer.remarks && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 font-semibold">{selectedTransfer.remarks}</p>
                                            </div>
                                        )}

                                        {/* Products Table */}
                                        <div className="space-y-3">
                                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transfer Items</h5>
                                            <div className="space-y-2.5">
                                                {selectedTransfer.items?.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                                {item.product?.images?.[0] && (
                                                                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-950 dark:text-white">{item.product?.name}</p>
                                                                {item.variant?.combination && (
                                                                    <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                                                                        {Object.entries(item.variant.combination).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-slate-500">
                                                                Requested: <span className="font-black text-slate-900 dark:text-white">{item.quantityRequested}</span>
                                                            </p>
                                                            {selectedTransfer.status === 'RECEIVED' && (
                                                                <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                                                                    Received: <span className="font-black">{item.quantityReceived}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sheet Actions Footer */}
                                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 justify-between items-center">
                                        <div>
                                            {selectedTransfer.status !== 'RECEIVED' && selectedTransfer.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={() => handleCancel(selectedTransfer.id)}
                                                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    Cancel Transfer
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {selectedTransfer.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleApprove(selectedTransfer.id)}
                                                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Approve Document
                                                </button>
                                            )}

                                            {(selectedTransfer.status === 'APPROVED' || selectedTransfer.status === 'DRAFT') && (
                                                <button
                                                    onClick={() => handleShip(selectedTransfer.id)}
                                                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                                                >
                                                    <Truck className="w-3.5 h-3.5" />
                                                    Dispatch (Ship)
                                                </button>
                                            )}

                                            {selectedTransfer.status === 'IN_TRANSIT' && (
                                                <button
                                                    onClick={() => setReceiveOpen(true)}
                                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Record Receipt
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Receipt Modal */}
            <AnimatePresence>
                {receiveOpen && selectedTransfer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-4 border-b border-slate-50 dark:border-slate-800 pb-3">
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white">Record Warehouse Receipt</h4>
                                    <p className="text-xs text-slate-400">Review received quantities for {selectedTransfer.transferNumber}</p>
                                </div>
                                <button onClick={() => setReceiveOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-2">
                                {selectedTransfer.items?.map((item) => (
                                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">{item.product?.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Requested: {item.quantityRequested}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-bold text-slate-400">Recv Qty:</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={item.quantityRequested}
                                                value={receiveQtys[item.id] ?? item.quantityRequested}
                                                onChange={e => setReceiveQtys(prev => ({
                                                    ...prev,
                                                    [item.id]: Math.min(Number(item.quantityRequested), Math.max(0, Number(e.target.value)))
                                                }))}
                                                className="w-16 text-center px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-brand-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                                <button
                                    onClick={() => setReceiveOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReceive(selectedTransfer.id)}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                                >
                                    Confirm & Update Stock
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Product Picker Modal */}
            <AnimatePresence>
                {pickerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Add Product to Transfer</h4>
                                <button onClick={() => setPickerOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={pickerSearch}
                                    onChange={e => setPickerSearch(e.target.value)}
                                    autoFocus
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none"
                                />
                            </div>
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                {filteredProducts.map(p => (
                                    <div key={p.id}>
                                        {(!p.variants || p.variants.length === 0) ? (
                                            <button
                                                type="button"
                                                onClick={() => addLine(p)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-2xl transition-all text-left"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                                                    <p className="text-[10px] text-slate-400">Stock: {p.stock}</p>
                                                </div>
                                            </button>
                                        ) : (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 py-1">{p.name}</p>
                                                {p.variants.map((v: any) => (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        onClick={() => addLine(p, v)}
                                                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all text-left ml-2"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            {Object.entries(v.combination || {}).map(([k, val]) => `${k}: ${val}`).join(' / ')} — Stock: {v.stock}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <p className="text-center text-slate-400 py-6 text-sm">No products match your search.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
