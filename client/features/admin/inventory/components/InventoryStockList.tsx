'use client';

import {
    Package, Search, AlertTriangle, XCircle, CheckCircle,
    BarChart3, DollarSign, ChevronDown, ChevronRight, Settings2, Loader2
} from 'lucide-react';
import { Fragment, memo } from 'react';
import { InventoryStockListProps, ProductStock, VariantStock } from '../type';

// Memoized Summary Card component
const SummaryCard = memo(({ title, value, icon: Icon, colorClass, borderClass }: any) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${borderClass || 'border-slate-100 dark:border-slate-700'} shadow-sm transition-all hover:shadow-md group`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 ${colorClass} rounded-xl transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
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
            className={`group hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${product.hasVariants ? 'cursor-pointer' : ''}`}
            onClick={() => product.hasVariants && onToggle(product.id)}
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    {product.hasVariants && (
                        <div className="transition-transform group-hover:scale-110">
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
            </td>
            <td className="px-6 py-4">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">
                    {product.categoryName || '—'}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">
                    {product.supplierName || '—'}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3 min-w-[120px]">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${s.bar} rounded-full transition-all duration-700 ease-out`}
                            style={{ width: `${s.pct}%` }}
                        />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-xs w-8 text-right font-mono" title="Physical Stock">{product.stock}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="font-black text-amber-600 dark:text-amber-400 text-xs font-mono">
                    {product.reservedStock || 0}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`font-black text-xs font-mono ${(product.stock - (product.reservedStock || 0)) <= (product.lowStockThreshold || 5) ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {product.stock - (product.reservedStock || 0)}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="font-black text-slate-900 dark:text-white font-mono text-sm underline decoration-slate-200 dark:decoration-slate-700 decoration-2 underline-offset-4">
                    {formatPrice(product.stockValue)}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-sm border ${s.class} border-current/10`}>
                    <s.Icon className="w-3 h-3" />
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
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-brand-500 transition-all hover:rotate-90 active:scale-90"
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product Line</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Physical</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reserved</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Available</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assets</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Health</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading && products.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={9} className="px-6 py-10">
                                            <div className="h-12 bg-slate-100 dark:bg-slate-700/30 animate-pulse rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-2">
                                                <BarChart3 className="w-10 h-10 text-slate-200" strokeWidth={1} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No Inventory Matched</p>
                                                <p className="text-sm text-slate-500 font-medium">Try adjusting your search criteria or filters to view stock levels.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(p => (
                                    <Fragment key={p.id}>
                                        <ProductRow
                                            product={p}
                                            isExpanded={expandedIds.has(p.id)}
                                            onToggle={onToggleExpand}
                                            onAdjust={onAdjustProduct}
                                            formatPrice={formatPrice}
                                        />
                                        {/* Variant rows */}
                                        {p.hasVariants && expandedIds.has(p.id) && p.variants.map((v: VariantStock) => (
                                            <tr key={v.id} className="bg-slate-50/50 dark:bg-slate-900/30 transition-all">
                                                <td className="px-6 py-4 pl-24">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-600),0.4)] flex-shrink-0" />
                                                        <div>
                                                            <p className="font-black text-slate-700 dark:text-slate-300 text-xs italic uppercase tracking-wider">
                                                                {Object.entries(v.combination || {}).map(([k, val]) => `${val}`).join(' / ')}
                                                            </p>
                                                            <p className="text-[9px] text-slate-400 font-mono font-black mt-0.5 uppercase tracking-tighter">SKU: {v.sku}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4" />
                                                <td className="px-6 py-4" />
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3 min-w-[120px]">
                                                        <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${v.stock === 0 ? 'bg-red-500' : v.stock <= (v.lowStockThreshold || 5) ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${Math.min(100, (v.stock / 20) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`font-black text-[10px] min-w-[20px] text-right font-mono ${v.stock === 0 ? 'text-red-500' : v.stock <= (v.lowStockThreshold || 5) ? 'text-orange-500' : 'text-slate-500'}`}>
                                                            {v.stock}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 font-mono">
                                                        {v.reservedStock || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-black font-mono ${(v.stock - (v.reservedStock || 0)) <= (v.lowStockThreshold || 5) ? 'text-orange-500' : 'text-emerald-500'}`}>
                                                        {v.stock - (v.reservedStock || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 font-mono">
                                                        {formatPrice(v.stock * Number(v.price))}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${v.stock === 0 ? 'bg-red-50 text-red-500 border-red-100' : v.stock <= (v.lowStockThreshold || 5) ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                                        {v.stock === 0 ? 'Depleted' : v.stock <= (v.lowStockThreshold || 5) ? 'Critical' : 'Stable'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onAdjustVariant(p, v);
                                                        }}
                                                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-brand-500 transition-all shadow-sm active:scale-90"
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

export default memo(InventoryStockList);
