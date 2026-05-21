'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftRight,
    Loader2,
    Plus,
    Trash2,
    Search,
    Warehouse,
    Package,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface TransferLine {
    productId: string;
    productName: string;
    variantId?: string;
    variantLabel?: string;
    quantity: number;
}

export default function StockTransfer() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [sourceId, setSourceId] = useState('');
    const [destId, setDestId] = useState('');
    const [remarks, setRemarks] = useState('');
    const [lines, setLines] = useState<TransferLine[]>([]);

    // Product picker state
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
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

    const addLine = (product: any, variant?: any) => {
        const exists = lines.find(
            l => l.productId === product.id && l.variantId === (variant?.id || undefined)
        );
        if (exists) {
            toast('This product/variant is already in the transfer list.');
            return;
        }
        setLines(prev => [
            ...prev,
            {
                productId: product.id,
                productName: product.name,
                variantId: variant?.id,
                variantLabel: variant
                    ? Object.entries(variant.combination || {}).map(([k, v]) => `${k}: ${v}`).join(' / ')
                    : undefined,
                quantity: 1,
            },
        ]);
        setPickerOpen(false);
        setPickerSearch('');
    };

    const updateQty = (idx: number, val: number) => {
        setLines(prev => prev.map((l, i) => i === idx ? { ...l, quantity: Math.max(1, val) } : l));
    };

    const removeLine = (idx: number) => {
        setLines(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceId || !destId) { toast.error('Select source and destination warehouses'); return; }
        if (sourceId === destId) { toast.error('Source and destination must differ'); return; }
        if (lines.length === 0) { toast.error('Add at least one product line'); return; }

        setSubmitting(true);
        try {
            // Process each line sequentially
            let success = 0;
            for (const line of lines) {
                const res = await fetchAPI('/inventory-ledger/stock-transfer', {
                    method: 'POST',
                    body: JSON.stringify({
                        productId: line.productId,
                        variantId: line.variantId || undefined,
                        sourceWarehouseId: sourceId,
                        destinationWarehouseId: destId,
                        quantity: line.quantity,
                        remarks: remarks || undefined,
                    }),
                });
                if (res.success) success++;
            }
            toast.success(`Transfer complete — ${success}/${lines.length} lines processed`);
            setLines([]);
            setSourceId('');
            setDestId('');
            setRemarks('');
        } catch (err: any) {
            toast.error(err?.message || 'Transfer failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.slug?.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-brand-600" />
                    Stock Transfer
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Move inventory between warehouses. Each transfer creates paired TRANSFER_OUT and TRANSFER_IN ledger entries.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Warehouse Selector */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Transfer Route</h4>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Source Warehouse</label>
                            <div className="relative">
                                <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={sourceId}
                                    onChange={e => setSourceId(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none font-bold appearance-none"
                                >
                                    <option value="">Select Source...</option>
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
                                <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Remarks (Optional)</label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="e.g. Monthly redistribution, branch restock..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Transfer Lines */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Transfer Lines ({lines.length})
                        </h4>
                        <button
                            type="button"
                            onClick={() => setPickerOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/20"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Product
                        </button>
                    </div>

                    {lines.length === 0 ? (
                        <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-2 text-slate-400">
                            <Package className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            <span className="text-sm">No products added yet. Click "Add Product" to begin.</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lines.map((line, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl"
                                >
                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <Package className="w-4 h-4 text-brand-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{line.productName}</p>
                                        {line.variantLabel && (
                                            <p className="text-[10px] font-mono text-slate-400">{line.variantLabel}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-slate-500">Qty:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={line.quantity}
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

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting || lines.length === 0}
                        className="flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeftRight className="w-5 h-5" />}
                        {submitting ? 'Processing...' : 'Execute Transfer'}
                    </button>
                </div>
            </form>

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
                                <button onClick={() => setPickerOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <AlertCircle className="w-4 h-4 text-slate-400" />
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
