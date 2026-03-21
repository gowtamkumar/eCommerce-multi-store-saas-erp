'use client';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import {
    Package, Search, AlertTriangle, XCircle, CheckCircle,
    TrendingDown, BarChart3, DollarSign, ChevronDown, ChevronRight, Settings2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import StockAdjustmentModal from './StockAdjustmentModal';
import { FilterType, ProductStock } from '../type';



export default function InventoryDashboard() {
    const [products, setProducts] = useState<ProductStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [selectedAdjustmentProduct, setSelectedAdjustmentProduct] = useState<any>(null);
    const [selectedAdjustmentVariant, setSelectedAdjustmentVariant] = useState<any>(null);
    const { formatPrice } = useSettings();

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            const res = await fetchAPI('/inventory-transactions/stock-summary');
            if (res.success) {
                setProducts(res.data);
            }
        } catch (error) {
            toast.error('Failed to load stock data');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.supplierName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filter === 'all' ||
            (filter === 'lowStock' && p.lowStock) ||
            (filter === 'outOfStock' && p.outOfStock) ||
            (filter === 'inStock' && !p.lowStock && !p.outOfStock);
        return matchesSearch && matchesFilter;
    });

    const totalProducts = products.length;
    const totalValue = products.reduce((s, p) => s + p.stockValue, 0);
    const outOfStockCount = products.filter(p => p.outOfStock).length;
    const lowStockCount = products.filter(p => p.lowStock).length;

    const stockStatus = (p: ProductStock) => {
        if (p.outOfStock) return { label: 'Out of Stock', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', Icon: XCircle, bar: 'bg-red-500', pct: 0 };
        if (p.lowStock) return { label: 'Low Stock', class: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', Icon: AlertTriangle, bar: 'bg-orange-500', pct: 20 };
        return { label: 'In Stock', class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', Icon: CheckCircle, bar: 'bg-emerald-500', pct: Math.min(100, (p.stock / 50) * 100) };
    };

    const FILTERS: { key: FilterType; label: string; count: number }[] = [
        { key: 'all', label: 'All Products', count: totalProducts },
        { key: 'inStock', label: 'In Stock', count: products.filter(p => !p.lowStock && !p.outOfStock).length },
        { key: 'lowStock', label: 'Low Stock', count: lowStockCount },
        { key: 'outOfStock', label: 'Out of Stock', count: outOfStockCount },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Inventory Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Live stock levels across all products & variants</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
                            <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Products</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{totalProducts}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Stock Value</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{formatPrice(totalValue)}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Low Stock</p>
                    </div>
                    <p className="text-3xl font-black text-orange-600 dark:text-orange-400">{lowStockCount}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Out of Stock</p>
                    </div>
                    <p className="text-3xl font-black text-red-600 dark:text-red-400">{outOfStockCount}</p>
                </div>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${filter === f.key
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-500'
                                }`}
                        >
                            {f.label}
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${filter === f.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                {f.count}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search product, category, supplier..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Product</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Category</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Supplier</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Stock</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Stock Value</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-6 py-4">
                                            <div className="h-10 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-24 text-center space-y-4">
                                        <BarChart3 className="w-12 h-12 text-slate-200 mx-auto" strokeWidth={1} />
                                        <p className="text-sm text-slate-400 font-bold">No products match your filter</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(p => {
                                    const s = stockStatus(p);
                                    const isExpanded = expandedIds.has(p.id);
                                    return (
                                        <>
                                            <tr
                                                key={p.id}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${p.hasVariants ? 'cursor-pointer' : ''}`}
                                                onClick={() => p.hasVariants && toggleExpand(p.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        {p.hasVariants && (
                                                            isExpanded
                                                                ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                                : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                        )}
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                                            {p.images?.[0] ? (
                                                                <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="w-5 h-5 text-slate-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 dark:text-white">{p.name}</p>
                                                            <p className="text-xs text-slate-400 font-mono">{formatPrice(p.price)}</p>
                                                            {p.hasVariants && (
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                                                                    {p.variants.length} variants
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                        {p.categoryName || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                        {p.supplierName || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3 min-w-[120px]">
                                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${s.bar} rounded-full transition-all`}
                                                                style={{ width: `${s.pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-black text-slate-900 dark:text-white text-sm w-8 text-right">{p.stock}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-black text-slate-900 dark:text-white font-mono">
                                                        {formatPrice(p.stockValue)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${s.class}`}>
                                                        <s.Icon className="w-3.5 h-3.5" />
                                                        {s.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!p.hasVariants && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedAdjustmentProduct(p);
                                                                setIsAdjustmentModalOpen(true);
                                                            }}
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-brand-500 transition-colors"
                                                            title="Adjust Stock"
                                                        >
                                                            <Settings2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {/* Variant rows */}
                                            {p.hasVariants && isExpanded && p.variants.map(v => (
                                                <tr key={v.id} className="bg-slate-50 dark:bg-slate-900/30">
                                                    <td className="px-6 py-3 pl-20">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                                                    {Object.entries(v.combination).map(([k, val]) => `${k}: ${val}`).join(' / ')}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-mono">SKU: {v.sku}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3" />
                                                    <td className="px-6 py-3" />
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-3 min-w-[120px]">
                                                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${v.stock === 0 ? 'bg-red-400' : v.stock <= 5 ? 'bg-orange-400' : 'bg-emerald-400'}`}
                                                                    style={{ width: `${Math.min(100, (v.stock / 20) * 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className={`font-black text-sm w-8 text-right ${v.stock === 0 ? 'text-red-500' : v.stock <= 5 ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>
                                                                {v.stock}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">
                                                            {formatPrice(v.stock * Number(v.price))}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${v.stock === 0 ? 'text-red-500' : v.stock <= (v.lowStockThreshold || 5) ? 'text-orange-500' : 'text-emerald-500'}`}>
                                                            {v.stock === 0 ? 'Out of stock' : v.stock <= (v.lowStockThreshold || 5) ? 'Low stock' : 'Available'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedAdjustmentProduct(p);
                                                                setSelectedAdjustmentVariant(v);
                                                                setIsAdjustmentModalOpen(true);
                                                            }}
                                                            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-500 transition-colors"
                                                            title="Adjust Variant Stock"
                                                        >
                                                            <Settings2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <StockAdjustmentModal
                    isOpen={isAdjustmentModalOpen}
                    initialProduct={selectedAdjustmentProduct}
                    initialVariant={selectedAdjustmentVariant}
                    onClose={() => {
                        setIsAdjustmentModalOpen(false);
                        setSelectedAdjustmentProduct(null);
                        setSelectedAdjustmentVariant(null);
                    }}
                    onSuccess={fetchStock}
                />

                {/* Footer */}
                {!loading && filtered.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing <span className="font-black text-slate-900 dark:text-white">{filtered.length}</span> of <span className="font-black">{totalProducts}</span> products
                        </p>
                        <Link href="/admin/inventory" className="text-sm font-bold text-brand-600 hover:underline flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" /> View Transaction History
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
