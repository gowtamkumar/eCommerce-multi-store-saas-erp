'use client';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import {
    Package, Search, AlertTriangle, XCircle, CheckCircle,
    BarChart3, DollarSign, ChevronDown, ChevronRight, Settings2, Loader2
} from 'lucide-react';
import { Fragment, useEffect, useState, memo, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import StockAdjustmentModal from './StockAdjustmentModal';
import { FilterType, ProductStock } from '../type';

// Memoized Summary Card component
const SummaryCard = memo(({ title, value, icon: Icon, colorClass, borderClass }: any) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${borderClass || 'border-slate-100 dark:border-slate-700'} shadow-sm transition-all hover:shadow-md`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 ${colorClass} rounded-xl`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{title}</p>
        </div>
        <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{value}</p>
    </div>
));
SummaryCard.displayName = 'SummaryCard';

// Memoized Product Row component
const ProductRow = memo(({ product, isExpanded, onToggle, onAdjust, formatPrice }: any) => {
    const stockStatus = (p: ProductStock) => {
        if (p.outOfStock) return { label: 'Out of Stock', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', Icon: XCircle, bar: 'bg-red-500', pct: 0 };
        if (p.lowStock) return { label: 'Low Stock', class: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', Icon: AlertTriangle, bar: 'bg-orange-500', pct: 20 };
        return { label: 'In Stock', class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', Icon: CheckCircle, bar: 'bg-emerald-500', pct: Math.min(100, (p.stock / 50) * 100) };
    };

    const s = stockStatus(product);

    return (
        <tr
            className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${product.hasVariants ? 'cursor-pointer' : ''}`}
            onClick={() => product.hasVariants && onToggle(product.id)}
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    {product.hasVariants && (
                        isExpanded
                            ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-600">
                        {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-slate-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-black text-slate-900 dark:text-white leading-tight">{product.name}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{formatPrice(product.price)}</p>
                        {product.hasVariants && (
                            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-md">
                                {product.variants.length} variants
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                    {product.categoryName || '—'}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                    {product.supplierName || '—'}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3 min-w-[120px]">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${s.bar} rounded-full transition-all duration-500`}
                            style={{ width: `${s.pct}%` }}
                        />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-sm w-10 text-right">{product.stock}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
                    {formatPrice(product.stockValue)}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm ${s.class}`}>
                    <s.Icon className="w-3.5 h-3.5" />
                    {s.label}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                {!product.hasVariants && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdjust(product);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-brand-500 transition-colors"
                        title="Adjust Stock"
                    >
                        <Settings2 className="w-5 h-5" />
                    </button>
                )}
            </td>
        </tr>
    );
});
ProductRow.displayName = 'ProductRow';

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

    const fetchStock = useCallback(async () => {
        setLoading(true);
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
    }, []);

    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleAdjustProduct = useCallback((p: any) => {
        setSelectedAdjustmentProduct(p);
        setSelectedAdjustmentVariant(null);
        setIsAdjustmentModalOpen(true);
    }, []);

    const handleAdjustVariant = useCallback((p: any, v: any) => {
        setSelectedAdjustmentProduct(p);
        setSelectedAdjustmentVariant(v);
        setIsAdjustmentModalOpen(true);
    }, []);

    const filtered = useMemo(() => {
        return products.filter(p => {
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
    }, [products, searchQuery, filter]);

    const stats = useMemo(() => {
        const totalValue = products.reduce((s, p) => s + p.stockValue, 0);
        const outOfStockCount = products.filter(p => p.outOfStock).length;
        const lowStockCount = products.filter(p => p.lowStock).length;
        const inStockCount = products.filter(p => !p.lowStock && !p.outOfStock).length;

        return {
            totalProducts: products.length,
            totalValue,
            outOfStockCount,
            lowStockCount,
            inStockCount
        };
    }, [products]);

    const FILTERS: { key: FilterType; label: string; count: number }[] = [
        { key: 'all', label: 'All Products', count: stats.totalProducts },
        { key: 'inStock', label: 'In Stock', count: stats.inStockCount },
        { key: 'lowStock', label: 'Low Stock', count: stats.lowStockCount },
        { key: 'outOfStock', label: 'Out of Stock', count: stats.outOfStockCount },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inventory Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live stock summary across all channels
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard 
                    title="Total Products" 
                    value={stats.totalProducts} 
                    icon={Package} 
                    colorClass="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400" 
                />
                <SummaryCard 
                    title="Estimated Assets" 
                    value={formatPrice(stats.totalValue)} 
                    icon={DollarSign} 
                    colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                />
                <SummaryCard 
                    title="Low Stock" 
                    value={stats.lowStockCount} 
                    icon={AlertTriangle} 
                    colorClass="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                    borderClass="border-orange-100 dark:border-orange-900/30"
                />
                <SummaryCard 
                    title="Critical Stock" 
                    value={stats.outOfStockCount} 
                    icon={XCircle} 
                    colorClass="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    borderClass="border-red-100 dark:border-red-900/30"
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm ${filter === f.key
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-500'
                                }`}
                        >
                            {f.label}
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${filter === f.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                {f.count}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search product, category, SKU..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product Line</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assets</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Health</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-6 py-8">
                                            <div className="h-12 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-24 text-center space-y-4">
                                        <BarChart3 className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto" strokeWidth={1} />
                                        <div className="space-y-1">
                                            <p className="text-base font-black text-slate-900 dark:text-white">No Inventory Matched</p>
                                            <p className="text-sm text-slate-500">Try adjusting your search criteria or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(p => (
                                    <Fragment key={p.id}>
                                        <ProductRow 
                                            product={p} 
                                            isExpanded={expandedIds.has(p.id)} 
                                            onToggle={toggleExpand} 
                                            onAdjust={handleAdjustProduct}
                                            formatPrice={formatPrice}
                                        />
                                        {/* Variant rows */}
                                        {p.hasVariants && expandedIds.has(p.id) && p.variants.map((v: any) => (
                                            <tr key={v.id} className="bg-slate-50/50 dark:bg-slate-900/30">
                                                <td className="px-6 py-4 pl-20">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(var(--brand-600),0.5)] flex-shrink-0" />
                                                        <div>
                                                            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm italic">
                                                                {Object.entries(v.combination || {}).map(([k, val]) => `${k}: ${val}`).join(' / ')}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 uppercase">SKU: {v.sku}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4" />
                                                <td className="px-6 py-4" />
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3 min-w-[120px]">
                                                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-700 ${v.stock === 0 ? 'bg-red-500' : v.stock <= (v.lowStockThreshold || 5) ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${Math.min(100, (v.stock / 20) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`font-black text-xs min-w-[20px] text-right ${v.stock === 0 ? 'text-red-500 font-black' : v.stock <= (v.lowStockThreshold || 5) ? 'text-orange-500' : 'text-slate-600 dark:text-slate-400'}`}>
                                                            {v.stock}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">
                                                        {formatPrice(v.stock * Number(v.price))}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${v.stock === 0 ? 'bg-red-50 text-red-500' : v.stock <= (v.lowStockThreshold || 5) ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                        {v.stock === 0 ? 'Depleted' : v.stock <= (v.lowStockThreshold || 5) ? 'Critical' : 'Stable'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAdjustVariant(p, v);
                                                        }}
                                                        className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-500 transition-colors shadow-sm"
                                                        title="Adjust Variant Stock"
                                                    >
                                                        <Settings2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && filtered.length > 0 && (
                    <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">
                            Viewing <span className="text-slate-900 dark:text-white font-black underline decoration-brand-500 decoration-2 underline-offset-4">{filtered.length} active metrics</span>
                        </p>
                        <Link href="/admin/inventory" className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10">
                            <BarChart3 className="w-4 h-4 text-brand-500" /> 
                            Audit History Log
                        </Link>
                    </div>
                )}
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
        </div>
    );
}
