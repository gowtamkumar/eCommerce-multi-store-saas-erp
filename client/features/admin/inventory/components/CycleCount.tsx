'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList,
    Plus,
    Trash2,
    Search,
    Loader2,
    Package,
    Warehouse,
    CheckCircle2,
    BarChart3,
    AlertTriangle,
} from 'lucide-react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface CountLine {
    productId: string;
    productName: string;
    variantId?: string;
    variantLabel?: string;
    liveStock: number | null; // null = loading
    countedQty: number;
    delta: number | null;
}

export default function CycleCount() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ processed: number; adjustments: number } | null>(null);

    const [warehouseId, setWarehouseId] = useState('');
    const [countRef, setCountRef] = useState(`COUNT-${Date.now().toString().slice(-6)}`);
    const [lines, setLines] = useState<CountLine[]>([]);

    // Product picker
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
                fetchAPI('/products?limit=200&status=active'),
            ]);
            if (wRes.success) {
                setWarehouses(wRes.data || []);
                if ((wRes.data || []).length > 0) setWarehouseId(wRes.data[0].id);
            }
            if (pRes.success) setProducts(pRes.data?.products || pRes.data || []);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const getProductStockSummary = async (productId: string, variantId?: string): Promise<number> => {
        try {
            const query = warehouseId ? `?warehouseId=${warehouseId}` : '';
            const res = await fetchAPI(`/inventory-ledger/stock-summary${query}`);
            if (res.success) {
                const summaryItem = (res.data || []).find((s: any) => {
                    if (variantId) {
                        return s.id === productId && s.variants?.some((v: any) => v.id === variantId);
                    }
                    return s.id === productId;
                });
                if (summaryItem) {
                    if (variantId) {
                        const v = summaryItem.variants?.find((v: any) => v.id === variantId);
                        return v?.stock ?? 0;
                    }
                    return summaryItem.stock ?? 0;
                }
            }
        } catch { /* ignore */ }
        return 0;
    };

    const addLine = async (product: any, variant?: any) => {
        const exists = lines.find(
            l => l.productId === product.id && l.variantId === (variant?.id || undefined)
        );
        if (exists) { toast('Already added.'); return; }

        const newLine: CountLine = {
            productId: product.id,
            productName: product.name,
            variantId: variant?.id,
            variantLabel: variant
                ? Object.entries(variant.combination || {}).map(([k, v]) => `${k}: ${v}`).join(' / ')
                : undefined,
            liveStock: null,
            countedQty: 0,
            delta: null,
        };

        setLines(prev => [...prev, newLine]);
        setPickerOpen(false);
        setPickerSearch('');

        // Fetch live stock async
        const live = await getProductStockSummary(product.id, variant?.id);
        setLines(prev => prev.map(l =>
            l.productId === product.id && l.variantId === (variant?.id || undefined)
                ? { ...l, liveStock: live, delta: newLine.countedQty - live }
                : l
        ));
    };

    const updateCounted = (idx: number, val: number) => {
        setLines(prev => prev.map((l, i) => {
            if (i !== idx) return l;
            const counted = Math.max(0, val);
            const delta = l.liveStock !== null ? counted - l.liveStock : null;
            return { ...l, countedQty: counted, delta };
        }));
    };

    const removeLine = (idx: number) => {
        setLines(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!warehouseId) { toast.error('Select a warehouse'); return; }
        if (lines.length === 0) { toast.error('Add at least one product line'); return; }

        setSubmitting(true);
        try {
            const res = await fetchAPI('/inventory-ledger/cycle-count', {
                method: 'POST',
                body: JSON.stringify({
                    countRef,
                    warehouseId,
                    lines: lines.map(l => ({
                        productId: l.productId,
                        variantId: l.variantId || undefined,
                        countedQty: l.countedQty,
                    })),
                }),
            });

            if (res.success) {
                setResult({
                    processed: res.data.processed,
                    adjustments: res.data.adjustments?.length ?? 0,
                });
                toast.success(`Cycle count complete — ${res.data.adjustments?.length ?? 0} adjustments posted`);
                // Reset for next count
                setLines([]);
                setCountRef(`COUNT-${Date.now().toString().slice(-6)}`);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Cycle count failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.slug?.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    const hasDifferences = lines.some(l => l.delta !== null && l.delta !== 0);

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
                    <ClipboardList className="w-5 h-5 text-brand-600" />
                    Cycle Count
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Conduct a physical stock audit. Deltas between system and counted quantities are automatically reconciled as ADJUSTMENT ledger entries.
                </p>
            </div>

            {/* Result Banner */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 flex items-start gap-4"
                    >
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-emerald-800 dark:text-emerald-300">Cycle Count Completed</p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                                Processed <span className="font-black">{result.processed}</span> lines. Posted <span className="font-black">{result.adjustments}</span> adjustment{result.adjustments !== 1 ? 's' : ''} to the inventory ledger.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Count Setup */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Count Setup</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Count Reference #</label>
                            <input
                                type="text"
                                value={countRef}
                                onChange={e => setCountRef(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm font-mono font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Warehouse</label>
                            <div className="relative">
                                <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={warehouseId}
                                    onChange={e => {
                                        setWarehouseId(e.target.value);
                                        setLines([]);
                                    }}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none font-bold appearance-none"
                                >
                                    <option value="">Select Warehouse...</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Count Lines */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Count Lines ({lines.length})
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
                            <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            <span className="text-sm">Add products to count. System stock will be fetched automatically.</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Column headers */}
                            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                <div className="col-span-5">Product</div>
                                <div className="col-span-2 text-center">System</div>
                                <div className="col-span-2 text-center">Counted</div>
                                <div className="col-span-2 text-center">Delta</div>
                                <div className="col-span-1" />
                            </div>

                            {lines.map((line, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-12 gap-3 items-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl"
                                >
                                    {/* Product */}
                                    <div className="col-span-5 flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex-shrink-0">
                                            <Package className="w-3.5 h-3.5 text-brand-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{line.productName}</p>
                                            {line.variantLabel && (
                                                <p className="text-[9px] font-mono text-slate-400">{line.variantLabel}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* System stock */}
                                    <div className="col-span-2 text-center">
                                        {line.liveStock === null ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-slate-400 mx-auto" />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{line.liveStock}</span>
                                        )}
                                    </div>

                                    {/* Counted qty input */}
                                    <div className="col-span-2 text-center">
                                        <input
                                            type="number"
                                            min={0}
                                            value={line.countedQty}
                                            onChange={e => updateCounted(idx, Number(e.target.value))}
                                            className="w-full text-center px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>

                                    {/* Delta */}
                                    <div className="col-span-2 text-center">
                                        {line.delta === null ? (
                                            <span className="text-slate-400 text-xs">—</span>
                                        ) : line.delta === 0 ? (
                                            <span className="text-emerald-600 font-bold text-sm flex items-center justify-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> 0
                                            </span>
                                        ) : (
                                            <span className={`font-black text-sm flex items-center justify-center gap-1 ${line.delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                {line.delta > 0 ? '+' : ''}{line.delta}
                                            </span>
                                        )}
                                    </div>

                                    {/* Remove */}
                                    <div className="col-span-1 flex justify-end">
                                        <button type="button" onClick={() => removeLine(idx)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Delta summary banner */}
                    {hasDifferences && (
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                {lines.filter(l => l.delta !== 0 && l.delta !== null).length} line(s) have discrepancies.
                                Submitting will post ADJUSTMENT entries to reconcile the ledger.
                            </p>
                        </div>
                    )}
                </div>

                {/* Summary stats bar */}
                {lines.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            {
                                icon: BarChart3, label: 'Total Lines', value: lines.length,
                                color: 'text-slate-900 dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800'
                            },
                            {
                                icon: CheckCircle2, label: 'No Difference', value: lines.filter(l => l.delta === 0).length,
                                color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20'
                            },
                            {
                                icon: AlertTriangle, label: 'Discrepancies', value: lines.filter(l => l.delta !== 0 && l.delta !== null).length,
                                color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20'
                            },
                        ].map(stat => (
                            <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 flex items-center gap-3`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{stat.label}</p>
                                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting || lines.length === 0}
                        className="flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
                        {submitting ? 'Reconciling...' : 'Submit Count & Reconcile'}
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
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Add Product to Count</h4>
                                <button onClick={() => setPickerOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500">
                                    ✕
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
