import type { DataTableColumn } from '@/components/shared/DataTable';
import {
    AlertTriangle, CheckCircle, ChevronDown, ChevronRight, Package, XCircle,
} from 'lucide-react';
import { getAvailableStock } from '../../lib/warehouseStock';
import type { WarehouseStockTableRow } from '../../types';

interface BuildColumnsArgs {
    expandedIds: Set<string>;
    formatPrice: (price: number) => string;
}

const DEFAULT_THRESHOLD = 5;

export function buildWarehouseStockColumns({
    expandedIds,
    formatPrice,
}: BuildColumnsArgs): DataTableColumn<WarehouseStockTableRow>[] {
    return [
        {
            key: 'product',
            header: 'Product Line',
            cell: (item) => {
                if (item.isVariant) {
                    return (
                        <div className="flex items-center gap-4 pl-12">
                            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-600),0.4)] shrink-0" />
                            <div>
                                <p className="font-black text-slate-700 dark:text-slate-300 text-xs italic uppercase tracking-wider">
                                    {Object.values(item.combination || {}).join(' / ')}
                                </p>
                                <p className="text-[9px] text-slate-400 font-mono font-black mt-0.5 uppercase tracking-tighter">SKU: {item.sku}</p>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center gap-4">
                        {item.hasVariants && (
                            <div className="transition-transform group-hover:scale-110">
                                {expandedIds.has(item.id)
                                    ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                    : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                            </div>
                        )}
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600 transition-transform group-hover:scale-105">
                            {item.images?.[0] ? (
                                <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-slate-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-widest">{formatPrice(item.price || 0)}</p>
                            {item.hasVariants && (
                                <span className="inline-block mt-1 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-md border border-brand-100/50 dark:border-brand-900/30">
                                    {item.variants?.length} variations
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'category',
            header: 'Category',
            cell: (item) => {
                if (item.isVariant) return null;
                return (
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">
                        {item.categoryName || '-'}
                    </span>
                );
            },
        },
        {
            key: 'supplier',
            header: 'Supplier',
            cell: (item) => {
                if (item.isVariant) return null;
                return (
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">
                        {item.supplierName || '-'}
                    </span>
                );
            },
        },
        {
            key: 'physical',
            header: 'Physical',
            cell: (item) => {
                const stock = item.stock || 0;
                const threshold = item.lowStockThreshold || DEFAULT_THRESHOLD;
                const bar = item.isVariant
                    ? (stock === 0 ? 'bg-red-500' : stock <= threshold ? 'bg-orange-500' : 'bg-emerald-500')
                    : 'bg-emerald-500';
                const pct = item.isVariant
                    ? Math.min(100, (stock / 20) * 100)
                    : (item.outOfStock ? 0 : item.lowStock ? 20 : Math.min(100, (stock / 50) * 100));

                return (
                    <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${bar} rounded-full transition-all duration-700 ease-out`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span
                            className={`font-black text-xs w-8 text-right font-mono ${item.isVariant ? (stock === 0 ? 'text-red-500' : stock <= threshold ? 'text-orange-500' : 'text-slate-500') : 'text-slate-900 dark:text-white'}`}
                            title="Physical Stock"
                        >
                            {stock}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'reserved',
            header: 'Reserved',
            cell: (item) => (
                <span className="font-black text-amber-600 dark:text-amber-400 text-xs font-mono">
                    {item.reservedStock || 0}
                </span>
            ),
        },
        {
            key: 'available',
            header: 'Available',
            cell: (item) => {
                const available = getAvailableStock(item);
                const threshold = item.lowStockThreshold || DEFAULT_THRESHOLD;
                const isLow = available <= threshold;
                return (
                    <span className={`font-black text-xs font-mono ${isLow ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {available}
                    </span>
                );
            },
        },
        {
            key: 'assets',
            header: 'Assets',
            cell: (item) => {
                const val = item.isVariant ? ((item.stock || 0) * Number(item.price)) : (item.stockValue || 0);
                return (
                    <span className={`font-black font-mono ${item.isVariant ? 'text-xs text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white text-sm underline decoration-slate-200 dark:decoration-slate-700 decoration-2 underline-offset-4'}`}>
                        {formatPrice(val)}
                    </span>
                );
            },
        },
        {
            key: 'health',
            header: 'Health',
            cell: (item) => {
                if (item.isVariant) {
                    const threshold = item.lowStockThreshold || DEFAULT_THRESHOLD;
                    const stock = item.stock || 0;
                    const status = stock === 0 ? 'Depleted' : stock <= threshold ? 'Critical' : 'Stable';
                    const colorClass = stock === 0
                        ? 'bg-red-50 text-red-500 border-red-100'
                        : stock <= threshold ? 'bg-orange-50 text-orange-500 border-orange-100'
                            : 'bg-emerald-50 text-emerald-500 border-emerald-100';
                    return (
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${colorClass}`}>
                            {status}
                        </span>
                    );
                }
                const label = item.outOfStock ? 'Out of Stock' : item.lowStock ? 'Low Stock' : 'In Stock';
                const statusClass = item.outOfStock
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : item.lowStock ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
                const Icon = item.outOfStock ? XCircle : item.lowStock ? AlertTriangle : CheckCircle;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-sm border ${statusClass} border-current/10`}>
                        <Icon className="w-3 h-3" />
                        {label}
                    </span>
                );
            },
        },
    ];
}
