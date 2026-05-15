'use client';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Package, Plus, Minus, AlertCircle, Save, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { fetchAPI } from '@/services/api';
import { Product, StockAdjustmentModalProps } from '../type';



export default function StockAdjustmentModal({ isOpen, onClose, onSuccess, initialProduct, initialVariant }: StockAdjustmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
    const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
    const [type, setType] = useState('ADJUSTMENT');
    const [direction, setDirection] = useState<'IN' | 'OUT'>('IN');
    const [quantity, setQuantity] = useState(1);
    const [referenceId, setReferenceId] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            fetchWarehouses();
        }
        if (isOpen && initialProduct) {
            setSelectedProduct(initialProduct);
        }
        if (isOpen && initialVariant) {
            setSelectedVariant(initialVariant);
        }
    }, [isOpen, initialProduct, initialVariant]);

    const fetchWarehouses = async () => {
        try {
            const res = await fetchAPI('/system/warehouses');
            if (res.success) {
                setWarehouses(res.data || []);
                if (res.data.length > 0) setSelectedWarehouseId(res.data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch warehouses', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetchAPI('/products?limit=50');
            if (res.success) {
                setProducts(res.data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const handleSearch = (val: string) => {
        setSearchQuery(val);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) {
            toast.error('Please select a product');
            return;
        }

        setLoading(true);
        try {
            const res = await fetchAPI('/inventory-ledger', {
                method: 'POST',
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    variantId: selectedVariant?.id || null,
                    warehouseId: selectedWarehouseId,
                    type: type,
                    quantity: direction === 'IN' ? Number(quantity) : -Number(quantity),
                    referenceType: type === 'ADJUSTMENT' ? 'STOCK_ADJUSTMENT' : type,
                    referenceId
                })
            });

            if (res.success) {
                toast.success('Stock ledger updated successfully');
                onSuccess();
                onClose();
                resetForm();
            }
        } catch (error) {
            toast.error('Failed to adjust stock');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        if (!initialProduct) setSelectedProduct(null);
        setSelectedVariant(null);
        setQuantity(1);
        setDirection('IN');
        setType('ADJUSTMENT');
        setSearchQuery('');
        setReferenceId('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                                <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Stock Adjustment</h3>
                                <p className="text-xs text-slate-500 font-medium">Manually update stock levels</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Product Selection */}
                            {!selectedProduct ? (
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Select Product</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or slug..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                                        {filteredProducts.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setSelectedProduct(p)}
                                                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50/10 transition-all text-left"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">Current Stock: {p.stock}</p>
                                                </div>
                                                <Plus className="w-4 h-4 text-brand-500" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Selected Product Info */}
                                    <div className="p-4 bg-brand-50/20 dark:bg-brand-900/10 rounded-2xl border border-brand-100/50 dark:border-brand-900/30 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700">
                                                {selectedProduct.images?.[0] && <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{selectedProduct.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-500 font-medium">SKU: {selectedProduct.slug}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Stock: {selectedProduct.stock}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {!initialProduct && (
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedProduct(null); setSelectedVariant(null); }}
                                                className="text-xs font-bold text-red-500 hover:underline"
                                            >Change</button>
                                        )}
                                    </div>

                                    {/* Variant Selection if any */}
                                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    Select Variant <span className="text-red-500">*</span>
                                                </label>
                                                {!selectedVariant && (
                                                    <span className="text-[10px] font-bold text-orange-500 animate-pulse flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> Selection Required
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProduct.variants.map(v => (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        onClick={() => setSelectedVariant(v)}
                                                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${selectedVariant?.id === v.id
                                                            ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        {Object.entries(v.combination || {}).map(([k, val]) => `${k}: ${val}`).join(' / ')} ({v.stock})
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Warehouse & Type Selection */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Warehouse / Location</label>
                                            <select
                                                value={selectedWarehouseId}
                                                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm"
                                            >
                                                {warehouses.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Transaction Direction</label>
                                            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => setDirection('IN')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${direction === 'IN' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                >
                                                    <ArrowUpCircle className="w-4 h-4" /> Stock In
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDirection('OUT')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${direction === 'OUT' ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                >
                                                    <ArrowDownCircle className="w-4 h-4" /> Stock Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Transaction Type</label>
                                            <select
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm"
                                            >
                                                <option value="ADJUSTMENT">Stock Adjustment</option>
                                                <option value="RETURN">Customer Return</option>
                                                <option value="DAMAGE">Damage / Scrap</option>
                                                <option value="INITIAL_BALANCE">Opening Stock</option>
                                                <option value="PURCHASE">Purchase Receipt</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Quantity</label>
                                            <div className="flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="p-3 bg-slate-100 dark:bg-slate-900 rounded-l-xl text-slate-500 hover:text-slate-700 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                                    className="w-full py-2.5 bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 text-center font-black text-slate-900 dark:text-white outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="p-3 bg-slate-100 dark:bg-slate-900 rounded-r-xl text-slate-500 hover:text-slate-700 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Reference # (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="PO-123, Order ID, etc."
                                                value={referenceId}
                                                onChange={(e) => setReferenceId(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                        >Cancel</button>
                        <button
                            type="submit"
                            disabled={loading || !selectedProduct || (selectedProduct.variants?.length > 0 && !selectedVariant)}
                            onClick={handleSubmit}
                            className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Process Adjustment
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
