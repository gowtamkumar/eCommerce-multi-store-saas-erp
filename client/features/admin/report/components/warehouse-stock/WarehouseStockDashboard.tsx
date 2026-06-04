'use client';

import { useState, useEffect, useCallback, useMemo, Fragment, memo } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import {
    Warehouse, Search, Download, Package, AlertTriangle,
    XCircle, CheckCircle, ChevronDown, ChevronRight, Loader2, DollarSign, Building2
} from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

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



export default function WarehouseStockDashboard() {
    const { formatPrice } = useSettings();
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Fetch filters metadata (warehouses and branches)
    useEffect(() => {
        const initFilterData = async () => {
            try {
                setLoading(true);
                // Fetch warehouses
                const whRes = await fetchAPI('/system/warehouses');
                const whs = whRes.success ? (whRes.data || []) : [];
                setWarehouses(whs);

                // Fetch branches
                const brRes = await fetchAPI('/system/branches');
                const brs = brRes.success ? (brRes.data || []) : [];
                setBranches(brs);

                setSelectedWarehouseId('all');
            } catch (error) {
                console.error('Failed to load initial filters data', error);
                toast.error('Failed to load branch or warehouse filters');
            } finally {
                setLoading(false);
            }
        };
        initFilterData();
    }, []);

    // Filter warehouses by selected branch
    const filteredWarehouses = useMemo(() => {
        if (!selectedBranchId) return warehouses;
        return warehouses.filter(w => w.branchId === selectedBranchId || w.branch?.id === selectedBranchId);
    }, [warehouses, selectedBranchId]);

    // Handle branch change: reset warehouse filter
    const handleBranchChange = (branchId: string) => {
        setSelectedBranchId(branchId);
        setSelectedWarehouseId('all');
    };

    // Load data and handle aggregation
    const fetchStockReport = useCallback(async () => {
        if (warehouses.length === 0) return;
        setLoading(true);
        try {
            // Determine target warehouses to query
            let targetWarehouses: any[] = [];
            if (selectedWarehouseId && selectedWarehouseId !== 'all') {
                targetWarehouses = warehouses.filter(w => w.id === selectedWarehouseId);
            } else if (selectedBranchId) {
                targetWarehouses = warehouses.filter(w => w.branchId === selectedBranchId || w.branch?.id === selectedBranchId);
            } else {
                targetWarehouses = warehouses;
            }

            if (targetWarehouses.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            // Fetch stock summaries in parallel
            const fetchPromises = targetWarehouses.map(w =>
                fetchAPI(`/inventory-ledger/stock-summary?warehouseId=${w.id}`)
                    .then(res => ({ warehouseId: w.id, data: res.success ? (res.data || []) : [] }))
                    .catch(() => ({ warehouseId: w.id, data: [] }))
            );

            const results = await Promise.all(fetchPromises);

            // Single warehouse optimization (no merging needed)
            if (targetWarehouses.length === 1) {
                setProducts(results[0].data);
                setLoading(false);
                return;
            }

            // Aggregation across multiple warehouses
            const productMap = new Map<string, any>();

            results.forEach(({ data }) => {
                data.forEach((p: any) => {
                    if (!productMap.has(p.id)) {
                        productMap.set(p.id, {
                            ...p,
                            stock: 0,
                            stockValue: 0,
                            reservedStock: 0,
                            variants: p.variants ? p.variants.map((v: any) => ({
                                ...v,
                                stock: 0,
                                reservedStock: 0
                            })) : []
                        });
                    }

                    const existing = productMap.get(p.id);
                    existing.stock += p.stock || 0;
                    existing.stockValue += p.stockValue || 0;
                    existing.reservedStock += p.reservedStock || 0;

                    if (p.variants && p.variants.length > 0) {
                        p.variants.forEach((v: any) => {
                            const match = existing.variants.find((ev: any) => ev.id === v.id);
                            if (match) {
                                match.stock += v.stock || 0;
                                match.reservedStock += v.reservedStock || 0;
                            }
                        });
                    }
                });
            });

            // Convert aggregate Map to Array and recalculate thresholds
            const aggregated = Array.from(productMap.values()).map(p => {
                const hasVariants = p.variants && p.variants.length > 0;
                let isOutOfStock = false;
                let isLowStock = false;

                if (hasVariants) {
                    p.variants.forEach((v: any) => {
                        const available = v.stock - (v.reservedStock || 0);
                        v.outOfStock = v.stock === 0;
                        v.lowStock = available <= (v.lowStockThreshold || 5);
                    });
                    isOutOfStock = p.variants.every((v: any) => v.stock === 0);
                    isLowStock = p.variants.some((v: any) => v.lowStock);
                } else {
                    const available = p.stock - (p.reservedStock || 0);
                    isOutOfStock = p.stock === 0;
                    isLowStock = available <= (p.lowStockThreshold || 5);
                }

                return {
                    ...p,
                    lowStock: isLowStock,
                    outOfStock: isOutOfStock
                };
            });

            setProducts(aggregated);
        } catch (error) {
            console.error('Failed to load stock reports data', error);
            toast.error('Failed to load stock reports data');
        } finally {
            setLoading(false);
        }
    }, [selectedBranchId, selectedWarehouseId, warehouses]);

    useEffect(() => {
        fetchStockReport();
    }, [fetchStockReport]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    // Filter and search
    const filteredProducts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(query) ||
                p.categoryName?.toLowerCase().includes(query) ||
                p.supplierName?.toLowerCase().includes(query) ||
                p.variants?.some((v: any) => v.sku.toLowerCase().includes(query));

            const matchesFilter =
                filter === 'all' ||
                (filter === 'lowStock' && p.lowStock) ||
                (filter === 'outOfStock' && p.outOfStock) ||
                (filter === 'inStock' && !p.lowStock && !p.outOfStock);

            return matchesSearch && matchesFilter;
        });
    }, [products, searchQuery, filter]);

    // KPI Metrics calculation
    const stats = useMemo(() => {
        const totalValue = filteredProducts.reduce((sum, p) => sum + p.stockValue, 0);
        const outOfStockCount = filteredProducts.filter(p => p.outOfStock).length;
        const lowStockCount = filteredProducts.filter(p => p.lowStock).length;
        const inStockCount = filteredProducts.filter(p => !p.lowStock && !p.outOfStock).length;

        return {
            totalProducts: filteredProducts.length,
            totalValue,
            outOfStockCount,
            lowStockCount,
            inStockCount
        };
    }, [filteredProducts]);

    const tableData = useMemo(() => {
        const data: any[] = [];
        filteredProducts.forEach(p => {
            data.push({ ...p, isParent: true });
            if (p.hasVariants && expandedIds.has(p.id)) {
                p.variants.forEach((v: any) => {
                    data.push({ ...v, isVariant: true, parentProduct: p });
                });
            }
        });
        return data;
    }, [filteredProducts, expandedIds]);

    const getRowKey = useCallback((item: any) => {
        if (item.isVariant) return `variant-${item.id}`;
        return `product-${item.id}`;
    }, []);

    const getRowClassName = useCallback((item: any) => {
        if (item.isVariant) {
            return 'bg-slate-50/50 dark:bg-slate-900/30 transition-all';
        }
        return '';
    }, []);

    const handleRowClick = useCallback((item: any) => {
        if (item.isVariant) return;
        if (item.hasVariants) {
            toggleExpand(item.id);
        }
    }, [toggleExpand]);

    const columns = useMemo<DataTableColumn<any>[]>(() => [
        {
            key: 'product',
            header: 'Product Line',
            cell: (item) => {
                if (item.isVariant) {
                    return (
                        <div className="flex items-center gap-4 pl-12">
                            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-600),0.4)] flex-shrink-0" />
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
                                    ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                }
                            </div>
                        )}
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-600 transition-transform group-hover:scale-105">
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
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-widest">{formatPrice(item.price)}</p>
                            {item.hasVariants && (
                                <span className="inline-block mt-1 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-md border border-brand-100/50 dark:border-brand-900/30">
                                    {item.variants.length} variations
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'category',
            header: 'Category',
            cell: (item) => {
                if (item.isVariant) return null;
                return (
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">
                        {item.categoryName || '—'}
                    </span>
                );
            }
        },
        {
            key: 'supplier',
            header: 'Supplier',
            cell: (item) => {
                if (item.isVariant) return null;
                return (
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">
                        {item.supplierName || '—'}
                    </span>
                );
            }
        },
        {
            key: 'physical',
            header: 'Physical',
            cell: (item) => {
                const stock = item.stock || 0;
                const threshold = item.lowStockThreshold || 5;
                const bar = item.isVariant
                    ? (item.stock === 0 ? 'bg-red-500' : item.stock <= threshold ? 'bg-orange-500' : 'bg-emerald-500')
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
                        <span className={`font-black text-xs w-8 text-right font-mono ${item.isVariant ? (item.stock === 0 ? 'text-red-500' : item.stock <= threshold ? 'text-orange-500' : 'text-slate-500') : 'text-slate-900 dark:text-white'}`} title="Physical Stock">
                            {stock}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'reserved',
            header: 'Reserved',
            cell: (item) => (
                <span className="font-black text-amber-600 dark:text-amber-400 text-xs font-mono">
                    {item.reservedStock || 0}
                </span>
            )
        },
        {
            key: 'available',
            header: 'Available',
            cell: (item) => {
                const available = item.stock - (item.reservedStock || 0);
                const threshold = item.lowStockThreshold || 5;
                const isLow = available <= threshold;
                return (
                    <span className={`font-black text-xs font-mono ${isLow ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {available}
                    </span>
                );
            }
        },
        {
            key: 'assets',
            header: 'Assets',
            cell: (item) => {
                const val = item.isVariant ? (item.stock * Number(item.price)) : item.stockValue;
                return (
                    <span className={`font-black font-mono ${item.isVariant ? 'text-xs text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white text-sm underline decoration-slate-200 dark:decoration-slate-700 decoration-2 underline-offset-4'}`}>
                        {formatPrice(val)}
                    </span>
                );
            }
        },
        {
            key: 'health',
            header: 'Health',
            cell: (item) => {
                if (item.isVariant) {
                    const threshold = item.lowStockThreshold || 5;
                    const status = item.stock === 0 ? 'Depleted' : item.stock <= threshold ? 'Critical' : 'Stable';
                    const colorClass = item.stock === 0
                        ? 'bg-red-50 text-red-500 border-red-100'
                        : item.stock <= threshold ? 'bg-orange-50 text-orange-500 border-orange-100'
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
            }
        }
    ], [expandedIds, formatPrice]);

    // Export to CSV functionality
    const handleExportCSV = () => {
        try {
            const branchName = selectedBranchId ? (branches.find(b => b.id === selectedBranchId)?.name || 'Branch') : 'Global';
            const warehouseName = selectedWarehouseId === 'all' ? 'All-Warehouses' : (warehouses.find(w => w.id === selectedWarehouseId)?.name || 'Warehouse');

            let csvContent = 'Product,Category,Supplier,SKU,Variant,Stock,Reserved,Available,Unit Price,Asset Value,Status\n';

            filteredProducts.forEach(p => {
                const statusStr = p.outOfStock ? 'Out of Stock' : p.lowStock ? 'Low Stock' : 'In Stock';
                if (p.hasVariants) {
                    p.variants.forEach((v: any) => {
                        const variantStr = Object.values(v.combination || {}).join(' / ');
                        const available = v.stock - (v.reservedStock || 0);
                        csvContent += `"${p.name}","${p.categoryName || ''}","${p.supplierName || ''}","${v.sku}","${variantStr}",${v.stock},${v.reservedStock || 0},${available},${v.price},${v.stock * Number(v.price)},"${statusStr}"\n`;
                    });
                } else {
                    const available = p.stock - (p.reservedStock || 0);
                    csvContent += `"${p.name}","${p.categoryName || ''}","${p.supplierName || ''}","","N/A",${p.stock},${p.reservedStock || 0},${available},${p.price},${p.stockValue},"${statusStr}"\n`;
                }
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${branchName.toLowerCase().replace(/\s+/g, '-')}-${warehouseName.toLowerCase().replace(/\s+/g, '-')}-stock-report.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Failed to export CSV', error);
            toast.error('Failed to export CSV');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Branch/Warehouse Selectors */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Warehouse className="w-6 h-6 text-brand-600" />
                        Warehouse & Branch Stock Report
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track stock levels, valuations, and availability grouped by branch location and warehouse.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Branch Selector */}
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <select
                            value={selectedBranchId}
                            onChange={(e) => handleBranchChange(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer font-semibold text-slate-800 dark:text-slate-200"
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Warehouse Selector */}
                    <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-slate-400" />
                        <select
                            value={selectedWarehouseId}
                            onChange={(e) => setSelectedWarehouseId(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer font-semibold text-slate-800 dark:text-slate-200"
                        >
                            <option value="all">
                                {selectedBranchId ? 'All Branch Warehouses' : 'All Warehouses (Global)'}
                            </option>
                            {filteredWarehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleExportCSV}
                        disabled={loading || filteredProducts.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl transition-all font-medium border border-transparent disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Tracked Items"
                    value={stats.totalProducts}
                    icon={Package}
                    colorClass="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                />
                <SummaryCard
                    title="Asset Valuation"
                    value={formatPrice(stats.totalValue)}
                    icon={DollarSign}
                    colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                />
                <SummaryCard
                    title="Low Stock Warning"
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

            {/* Search & Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2.5">
                    {([
                        { key: 'all', label: 'All Products', count: products.length },
                        { key: 'inStock', label: 'In Stock', count: products.filter(p => !p.lowStock && !p.outOfStock).length },
                        { key: 'lowStock', label: 'Low Stock', count: products.filter(p => p.lowStock).length },
                        { key: 'outOfStock', label: 'Out of Stock', count: products.filter(p => p.outOfStock).length },
                    ] as const).map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
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
                        placeholder="Search product name, category, SKU..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Inventory Valuation Table using DataTable */}
            <DataTable
                data={tableData}
                columns={columns}
                getRowKey={getRowKey}
                loading={loading}
                loadingLabel="Reconciling branch/warehouse assets..."
                emptyLabel={
                    <div className="flex flex-col items-center gap-4 max-w-xs mx-auto py-12">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-2">
                            <Warehouse className="w-10 h-10 text-slate-200" strokeWidth={1} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No stock found</p>
                            <p className="text-sm text-slate-500 font-medium">There are no matching items for the selected location or filters.</p>
                        </div>
                    </div>
                }
                rowClassName={getRowClassName}
                onRowClick={handleRowClick}
                minWidthClassName="min-w-[1000px]"
                containerClassName="rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            />

            {/* Footer summary */}
            {!loading && filteredProducts.length > 0 && (
                <div className="flex items-center justify-between px-8 py-4 bg-slate-50/50 dark:bg-slate-900/40 border border-t-0 border-slate-100 dark:border-slate-700 rounded-[2.5rem] rounded-t-none -mt-6">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">
                        Branch/Warehouse assets reconciled: <span className="text-slate-900 dark:text-white underline decoration-brand-500 decoration-2 underline-offset-4">{filteredProducts.length} items</span>
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live data active</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                </div>
            )}
        </div>
    );
}
