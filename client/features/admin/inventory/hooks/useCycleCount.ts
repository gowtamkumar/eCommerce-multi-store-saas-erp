'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';

export interface CountLine {
    productId: string;
    productName: string;
    variantId?: string;
    variantLabel?: string;
    liveStock: number | null; // null = loading
    countedQty: number;
    delta: number | null;
}

const PICKER_PAGE_SIZE = 20;
const PICKER_DEBOUNCE_MS = 300;

export function useCycleCount() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ processed: number; adjustments: number } | null>(null);

    const [warehouseId, setWarehouseId] = useState('');
    const [countRef, setCountRef] = useState(`COUNT-${Date.now().toString().slice(-6)}`);
    const [lines, setLines] = useState<CountLine[]>([]);

    // Product picker — server-side search + pagination
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');
    const [pickerProducts, setPickerProducts] = useState<any[]>([]);
    const [pickerLoading, setPickerLoading] = useState(false);
    const [pickerPage, setPickerPage] = useState(1);
    const [pickerTotalPages, setPickerTotalPages] = useState(1);
    const [pickerTotal, setPickerTotal] = useState(0);

    const pickerReqIdRef = useRef(0);
    const pickerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initial load: Warehouses
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const wRes = await fetchAPI('/system/warehouses');
                if (wRes.success) {
                    setWarehouses(wRes.data || []);
                    if ((wRes.data || []).length > 0) setWarehouseId(wRes.data[0].id);
                }
            } catch {
                toast.error('Failed to load warehouses');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const fetchPickerPage = useCallback(async (page: number, q: string) => {
        const reqId = ++pickerReqIdRef.current;
        setPickerLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(PICKER_PAGE_SIZE),
                status: 'active',
            });
            if (q.trim()) params.set('q', q.trim());
            const res = await fetchAPI(`/products?${params.toString()}`);
            
            // Drop the response if a newer request has started.
            if (reqId !== pickerReqIdRef.current) return;
            if (res?.success) {
                setPickerProducts(res.data?.products || res.data || []);
                setPickerTotalPages(res.data?.totalPages ?? 1);
                setPickerTotal(res.data?.total ?? 0);
            } else {
                setPickerProducts([]);
                setPickerTotalPages(1);
                setPickerTotal(0);
            }
        } catch {
            if (reqId === pickerReqIdRef.current) {
                setPickerProducts([]);
                toast.error('Product search failed');
            }
        } finally {
            if (reqId === pickerReqIdRef.current) setPickerLoading(false);
        }
    }, []);

    // Debounced search: each keystroke restarts a 300 ms timer
    useEffect(() => {
        if (!pickerOpen) return;
        if (pickerDebounceRef.current) clearTimeout(pickerDebounceRef.current);
        pickerDebounceRef.current = setTimeout(() => {
            setPickerPage(1);
            void fetchPickerPage(1, pickerSearch);
        }, PICKER_DEBOUNCE_MS);
        return () => {
            if (pickerDebounceRef.current) clearTimeout(pickerDebounceRef.current);
        };
    }, [pickerSearch, pickerOpen, fetchPickerPage]);

    // Reload when paging (no debounce needed)
    useEffect(() => {
        if (!pickerOpen) return;
        void fetchPickerPage(pickerPage, pickerSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickerPage]);

    const openPicker = useCallback(() => {
        setPickerSearch('');
        setPickerPage(1);
        setPickerOpen(true);
        void fetchPickerPage(1, '');
    }, [fetchPickerPage]);

    const getProductStockSummary = useCallback(async (productId: string, variantId?: string): Promise<number> => {
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
    }, [warehouseId]);

    const addLine = useCallback(async (product: any, variant?: any) => {
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

        // Fetch live stock async
        const live = await getProductStockSummary(product.id, variant?.id);
        setLines(prev => prev.map(l =>
            l.productId === product.id && l.variantId === (variant?.id || undefined)
                ? { ...l, liveStock: live, delta: newLine.countedQty - live }
                : l
        ));
    }, [lines, getProductStockSummary]);

    const updateCounted = useCallback((idx: number, val: number) => {
        setLines(prev => prev.map((l, i) => {
            if (i !== idx) return l;
            const counted = Math.max(0, val);
            const delta = l.liveStock !== null ? counted - l.liveStock : null;
            return { ...l, countedQty: counted, delta };
        }));
    }, []);

    const removeLine = useCallback((idx: number) => {
        setLines(prev => prev.filter((_, i) => i !== idx));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
    }, [countRef, warehouseId, lines]);

    const hasDifferences = useMemo(() => {
        return lines.some(l => l.delta !== null && l.delta !== 0);
    }, [lines]);

    return {
        warehouses,
        setWarehouses,
        loading,
        submitting,
        result,
        setResult,
        warehouseId,
        setWarehouseId,
        countRef,
        setCountRef,
        lines,
        setLines,
        pickerOpen,
        setPickerOpen,
        pickerSearch,
        setPickerSearch,
        pickerProducts,
        pickerLoading,
        pickerPage,
        setPickerPage,
        pickerTotalPages,
        pickerTotal,
        fetchPickerPage,
        openPicker,
        getProductStockSummary,
        addLine,
        updateCounted,
        removeLine,
        handleSubmit,
        hasDifferences,
    };
}
