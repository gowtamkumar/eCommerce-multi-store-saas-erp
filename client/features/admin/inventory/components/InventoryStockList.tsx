'use client';

import {
    Package, AlertTriangle, XCircle, CheckCircle,
    BarChart3, DollarSign, ChevronDown, ChevronRight, Settings2, Loader2, Search
} from 'lucide-react';
import { useMemo } from 'react';
import { InventoryStockListProps, ProductStock, VariantStock } from '../type';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

// Memoized Summary Card component
const SummaryCard = ({ title, value, icon: Icon, colorClass, borderClass }: any) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${borderClass || 'border-slate-100 dark:border-slate-700'} shadow-sm transition-all hover:shadow-md group`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 ${colorClass} rounded-xl transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        </div>
        <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{value}</p>
    </div>
);

const InventoryStockList = ({
    products,
    filteredProducts,
    loading,
    searchQuery,
    onSearchChange,
    filter,
    onFilterChange,
    stats,
    expandedIds,
    onToggleExpand,
    onAdjustProduct,
    onAdjustVariant,
    formatPrice
}: InventoryStockListProps) => {
    const FILTERS: { key: any; label: string; count: number }[] = [
        { key: 'all', label: 'All Products', count: stats.totalProducts },
        { key: 'inStock', label: 'In Stock', count: stats.inStockCount },
        { key: 'lowStock', label: 'Low Stock', count: stats.lowStockCount },
        { key: 'outOfStock', label: 'Out of Stock', count: stats.outOfStockCount },
    ];

    const displayRows = useMemo(() => {
        const rows: any[] = [];
        filteredProducts.forEach(p => {
            rows.push({ type: 'product', id: p.id, data: p });
            if (p.hasVariants && expandedIds.has(p.id)) {
                p.variants.forEach((v: VariantStock) => {
                    rows.push({ type: 'variant', id: `${p.id}-${v.id}`, data: v, parentProduct: p });
                });
            }
        });
        return rows;
    }, [filteredProducts, expandedIds]);

    const columns = useMemo<DataTableColumn<any>[]>(() => [
        {
            key: 'name',
            header: 'Product Line',
            cell: (row) => {
                if (row.type === 'product') {
                    const product = row.data;
                    const isExpanded = expandedIds.has(product.id);
                    return (
                        <div className="flex items-center gap-4">
                            {product.hasVariants && (
                                <div className="transition-transform group-hover:scale-110 shrink-0">
                                    {isExpanded
                                        ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    }
                                </div>
                            )}
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-600 transition-transform group-hover:scale-105">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-5 h-5 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{product.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-widest">{formatPrice(product.price)}</p>
                                {product.hasVariants && (
                                    <span className="inline-block mt-1 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-md border border-brand-100/50 dark:border-brand-900/30">
                                        {product.variants.length} variations
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                } else {
                    const variant = row.data;
                    return (
                        <div className="flex items-center gap-4 pl-12 sm:pl-20">
                            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-600),0.4)] flex-shrink-0" />
                            <div>
                                <p className="font-black text-slate-700 dark:text-slate-300 text-xs italic uppercase tracking-wider">
                                    {Object.entries(variant.combination || {}).map(([k, val]) => `${val}`).join(' / ')}
                                </p>
                                <p className="text-[9px] text-slate-400 font-mono font-black mt-0.5 uppercase tracking-tighter">SKU: {variant.sku}</p>
                            </div>
                        </div>
                    );
                }
            }
        },
        {
            key: 'category',
            header: 'Category',
            cell: (row) => row.type === 'product' ? (
                <span className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">
                    {row.data.categoryName || '—'}
                </span>
            ) : null
        },
        {
            key: 'supplier',
            header: 'Supplier',
            cell: (row) => row.type === 'product' ? (
                <span className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">
                    {row.data.supplierName || '—'}
                </span>
            ) : null
        },
        {
            key: 'physical',
            header: 'Physical',
            cell: (row) => {
                if (row.type === 'product') {
                    const product = row.data;
                    const stockStatus = (p: ProductStock) => {
                        if (p.outOfStock) return { bar: 'bg-red-500', pct: 0 };
                        if (p.lowStock) return { bar: 'bg-orange-500', pct: 20 };
                        return { bar: 'bg-emerald-500', pct: Math.min(100, (p.stock / 50) * 100) };
                    };
                    const s = stockStatus(product);
                    return (
                        <div className="flex items-center gap-3 min-w-[120px]">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${s.bar} rounded-full transition-all duration-700 ease-out`}
                                    style={{ width: `${s.pct}%` }}
                                />
                            </div>
                            <span className="font-black text-slate-900 dark:text-white text-xs w-8 text-right font-mono" title="Physical Stock">{product.stock}</span>
                        </div>
                    );
                } else {
                    const variant = row.data;
                    return (
                        <div className="flex items-center gap-3 min-w-[120px]">
                            <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${variant.stock === 0 ? 'bg-red-500' : variant.stock <= (variant.lowStockThreshold || 5) ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, (variant.stock / 20) * 100)}%` }}
                                />
                            </div>
                            <span className={`font-black text-[10px] min-w-[20px] text-right font-mono ${variant.stock === 0 ? 'text-red-500' : variant.stock <= (variant.lowStockThreshold || 5) ? 'text-orange-500' : 'text-slate-500'}`}>
                                {variant.stock}
                            </span>
                        </div>
                    );
                }
            }
        },
        {
            key: 'reserved',
            header: 'Reserved',
            cell: (row) => {
                if (row.type === 'product') {
                    return (
                        <span className="font-black text-amber-600 dark:text-amber-400 text-xs font-mono">
                            {row.data.reservedStock || 0}
                        </span>
                    );
                } else {
                    return (
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 font-mono">
                            {row.data.reservedStock || 0}
                        </span>
                    );
                }
            }
        },
        {
            key: 'available',
            header: 'Available',
            cell: (row) => {
                if (row.type === 'product') {
                    const product = row.data;
                    const available = product.stock - (product.reservedStock || 0);
                    return (
                        <span className={`font-black text-xs font-mono ${available <= (product.lowStockThreshold || 5) ? 'text-orange-500' : 'text-emerald-500'}`}>
                            {available}
                        </span>
                    );
                } else {
                    const variant = row.data;
                    const available = variant.stock - (variant.reservedStock || 0);
                    return (
                        <span className={`text-[10px] font-black font-mono ${available <= (variant.lowStockThreshold || 5) ? 'text-orange-500' : 'text-emerald-500'}`}>
                            {available}
                        </span>
                    );
                }
            }
        },
        {
            key: 'assets',
            header: 'Assets',
            cell: (row) => {
                if (row.type === 'product') {
                    return (
                        <span className="font-black text-slate-900 dark:text-white font-mono text-sm underline decoration-slate-200 dark:decoration-slate-700 decoration-2 underline-offset-4">
                            {formatPrice(row.data.stockValue)}
                        </span>
                    );
                } else {
                    const variant = row.data;
                    return (
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 font-mono">
                            {formatPrice(variant.stock * Number(variant.price))}
                        </span>
                    );
                }
            }
        },
        {
            key: 'health',
            header: 'Health',
            cell: (row) => {
                if (row.type === 'product') {
                    const product = row.data;
                    const stockStatus = (p: ProductStock) => {
                        if (p.outOfStock) return { label: 'Out of Stock', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', Icon: XCircle };
                        if (p.lowStock) return { label: 'Low Stock', class: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', Icon: AlertTriangle };
                        return { label: 'In Stock', class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', Icon: CheckCircle };
                    };
                    const s = stockStatus(product);
                    return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-sm border ${s.class} border-current/10`}>
                            <s.Icon className="w-3 h-3" />
                            {s.label}
                        </span>
                    );
                } else {
                    const variant = row.data;
                    const variantClass = variant.stock === 0 ? 'bg-red-50 text-red-500 border-red-100' : variant.stock <= (variant.lowStockThreshold || 5) ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100';
                    const variantLabel = variant.stock === 0 ? 'Depleted' : variant.stock <= (variant.lowStockThreshold || 5) ? 'Critical' : 'Stable';
                    return (
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${variantClass}`}>
                            {variantLabel}
                        </span>
                    );
                }
            }
        },
        {
            key: 'actions',
            header: 'Settings',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => {
                if (row.type === 'product') {
                    const product = row.data;
                    if (product.hasVariants) return null;
                    return (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAdjustProduct(product);
                            }}
                            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-brand-500 transition-all hover:rotate-90 active:scale-90"
                            title="Adjust Stock"
                        >
                            <Settings2 className="w-5 h-5" />
                        </button>
                    );
                } else {
                    const variant = row.data;
                    const product = row.parentProduct;
                    return (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAdjustVariant(product, variant);
                            }}
                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-brand-500 transition-all shadow-sm active:scale-90"
                            title="Adjust Variant Stock"
                        >
                            <Settings2 className="w-4 h-4" />
                        </button>
                    );
                }
            }
        }
    ], [expandedIds, onAdjustProduct, onAdjustVariant, formatPrice]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
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
                <div className="flex flex-wrap gap-2.5">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => onFilterChange(f.key)}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${filter === f.key
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none scale-105'
                                : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600'
                                }`}
                        >
                            {f.label}
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${filter === f.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                {f.count}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search product, category, SKU..."
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <DataTable
                    data={displayRows}
                    columns={columns}
                    getRowKey={(row) => row.id}
                    loading={loading && products.length === 0}
                    loadingLabel="Loading history..."
                    emptyLabel={searchQuery || filter !== 'all' ? 'No records match your criteria.' : 'No inventory records found.'}
                    containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                    rowClassName={(row) => row.type === 'variant' ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}
                    onRowClick={(row) => row.type === 'product' && row.data.hasVariants && onToggleExpand(row.data.id)}
                />
                {!loading && filteredProducts.length > 0 && (
                    <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">
                            Analyzing <span className="text-slate-900 dark:text-white underline decoration-brand-500 decoration-2 underline-offset-4">{filteredProducts.length} unique inventory assets</span>
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live reconciliation active</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryStockList;
