'use client';

import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { ShoppingBag, Save, Loader2, Plus, Trash2, Package, Search, ChevronLeft, Truck, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, memo, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Memoized Item Row to prevent form re-renders on price/qty updates
const PurchaseOrderItemRow = memo(({
    item,
    index,
    onUpdate,
    onRemove,
    formatPrice
}: {
    item: any,
    index: number,
    onUpdate: (index: number, field: string, value: any) => void,
    onRemove: (index: number) => void,
    formatPrice: (p: number) => string
}) => {
    return (
        <tr className="group animate-in fade-in duration-300">
            <td className="py-5">
                <div className="font-bold text-slate-900 dark:text-white leading-tight">{item.name}</div>
                {item.variantLabel && (
                    <div className="text-[10px] text-brand-600 dark:text-brand-400 mt-1 uppercase tracking-widest font-black">{item.variantLabel}</div>
                )}
                <div className="text-[10px] text-slate-400 font-mono mt-1 opacity-70">SKU: {item.sku}</div>
            </td>
            <td className="py-5">
                <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
                    className="w-20 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-center focus:ring-2 focus:ring-brand-500 outline-none font-bold text-sm"
                />
            </td>
            <td className="py-5">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => onUpdate(index, 'unitPrice', e.target.value)}
                        className="w-32 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-6 pr-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm font-bold"
                    />
                </div>
            </td>
            <td className="py-5 text-right font-black text-slate-900 dark:text-white font-mono">
                {formatPrice(item.quantity * item.unitPrice)}
            </td>
            <td className="py-5 text-right">
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-100"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
});

PurchaseOrderItemRow.displayName = 'PurchaseOrderItemRow';

export default function PurchaseOrderForm() {
    const router = useRouter();
    const { formatPrice } = useSettings();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchProduct, setSearchProduct] = useState('');

    const [formData, setFormData] = useState({
        supplierId: '',
        referenceNumber: `PO-${Date.now().toString().slice(-6)}`,
        items: [] as any[]
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [supRes, prodRes] = await Promise.all([
                    fetchAPI('/suppliers'),
                    fetchAPI('/products?limit=100')
                ]);
                setSuppliers(Array.isArray(supRes) ? supRes : (supRes?.data?.items || []));
                setProducts(prodRes?.data || []);
            } catch (error) {
                console.error('Data loading failed', error);
            }
        };
        loadInitialData();
    }, []);

    const addItem = useCallback((product: any, variant?: any) => {
        if (formData.items.find(item =>
            variant ? (item.productId === product.id && item.variantId === variant.id) : (item.productId === product.id && !item.variantId)
        )) {
            toast.error('Item already added');
            return;
        }

        const variantLabel = variant ? Object.entries(variant.combination).map(([k, v]) => `${k}: ${v}`).join(', ') : '';

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                productId: product.id,
                variantId: variant?.id || null,
                name: product.name,
                variantLabel,
                sku: variant?.sku || product.sku || product.slug,
                quantity: 1,
                unitPrice: variant?.price || product.price
            }]
        }));
        setSearchProduct('');
    }, [formData.items]);

    const removeItem = useCallback((index: number) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    }, []);

    const updateItem = useCallback((index: number, field: string, value: any) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    }, []);

    const totalAmount = useMemo(() =>
        formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        [formData.items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            toast.error('Add at least one item');
            return;
        }

        setLoading(true);
        try {
            await fetchAPI('/purchase-orders', {
                method: 'POST',
                body: JSON.stringify({
                    supplierId: formData.supplierId,
                    referenceNumber: formData.referenceNumber,
                    items: formData.items.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId || null,
                        quantity: parseInt(item.quantity),
                        unitPrice: parseFloat(item.unitPrice)
                    }))
                })
            });

            toast.success('Purchase order created successfully');
            router.push('/admin/purchases');
        } catch (error) {
            console.error('Error saving purchase order:', error);
            toast.error('Failed to create purchase order');
        } finally {
            setLoading(false);
        }
    };

    const filteredProductList = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
            !formData.items.find(item => item.productId === p.id && !p.variants?.length)
        ),
        [products, searchProduct, formData.items]);

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-10 pb-32 pt-4 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <Link href="/admin/purchases" className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 group">
                        <ChevronLeft className="w-6 h-6 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Generate Purchase Order</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Operational Procurement Phase</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={loading || !formData.supplierId || formData.items.length === 0}
                        className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Finalize & Save Order
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Order Details */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                                <Package className="w-4 h-4 text-brand-500" />
                            </span>
                            Inventory Specification
                        </h3>

                        {/* Product Search */}
                        <div className="relative mb-8 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Scan or type products to include in order..."
                                value={searchProduct}
                                onChange={(e) => setSearchProduct(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-sm"
                            />

                            {searchProduct && (
                                <div className="absolute z-50 w-full mt-3 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[400px] overflow-y-auto p-2 scrollbar-none animate-in slide-in-from-top-2 duration-300">
                                    {filteredProductList.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No matches found</div>
                                    ) : (
                                        filteredProductList.flatMap(p => {
                                            if (p.variants && p.variants.length > 0) {
                                                return p.variants.map((v: any) => (
                                                    <button
                                                        key={`${p.id}-${v.id}`}
                                                        type="button"
                                                        onClick={() => addItem(p, v)}
                                                        className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-all text-left group"
                                                    >
                                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                                            {v.images?.[0] ? <img src={v.images[0]} alt="" className="w-full h-full object-cover" /> : (p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-400" />)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                                {Object.entries(v.combination || {}).map(([k, val]) => (
                                                                    <span key={k} className="text-[10px] bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-md text-brand-600 dark:text-brand-400 font-black uppercase tracking-tight">
                                                                        {k}: {val as string}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 mt-1 font-mono uppercase">SKU: {v.sku} | Stock: {v.stock}</div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Plus className="w-4 h-4 text-brand-500" />
                                                        </div>
                                                    </button>
                                                ));
                                            }
                                            return [
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => addItem(p)}
                                                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-all text-left group"
                                                >
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-400" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                                                        <div className="text-[10px] text-slate-500 mt-1 font-mono uppercase">SKU: {p.slug} | Stock: {p.stock}</div>
                                                    </div>
                                                    <div className="ml-auto w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Plus className="w-4 h-4 text-brand-500" />
                                                    </div>
                                                </button>
                                            ];
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full">
                                <thead className="text-left border-b border-slate-50 dark:border-slate-700">
                                    <tr>
                                        <th className="pb-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Entity</th>
                                        <th className="pb-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-24">Volume</th>
                                        <th className="pb-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32">Acquisition Price</th>
                                        <th className="pb-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32 text-right">Subtotal</th>
                                        <th className="pb-5 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {formData.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <ShoppingBag className="w-6 h-6 text-slate-200" strokeWidth={1} />
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] italic">No line items added to specification</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        formData.items.map((item, idx) => (
                                            <PurchaseOrderItemRow
                                                key={`${item.productId}-${item.variantId || 'base'}`}
                                                item={item}
                                                index={idx}
                                                onUpdate={updateItem}
                                                onRemove={removeItem}
                                                formatPrice={formatPrice}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {formData.items.length > 0 && (
                            <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Aggregate Purchase Value</div>
                                    <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{formatPrice(totalAmount)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 space-y-8 sticky top-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <Truck className="w-3.5 h-3.5 text-brand-500" /> Fulfillment Source
                            </label>
                            <select
                                required
                                value={formData.supplierId}
                                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-sm cursor-pointer"
                            >
                                <option value="">Select Supplier Entity</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-brand-500" /> Reference Identifier
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.referenceNumber}
                                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono text-sm font-bold uppercase tracking-wider"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 p-5 rounded-2xl">
                                <p className="text-[10px] text-brand-700 dark:text-brand-300 font-bold leading-relaxed uppercase tracking-wide">
                                    <strong className="block mb-1 text-xs">Lifecycle Protocol:</strong>
                                    New records initialize in <span className="text-brand-900 dark:text-white">DRAFT</span> status. Inventory synchronization executes only upon transition to <span className="text-brand-900 dark:text-white">RECEIVED</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
