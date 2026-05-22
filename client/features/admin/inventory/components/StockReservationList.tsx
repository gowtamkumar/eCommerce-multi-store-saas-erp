'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Calendar, ChevronLeft, ChevronRight, Loader2, 
    Info, ArrowUpRight, CheckCircle2, BookmarkCheck, RefreshCw, 
    XCircle, Clock, AlertTriangle, FileText, Lock, Layers, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';

interface StockReservation {
    id: string;
    productId: string;
    product?: {
        id: string;
        name: string;
        images?: string[];
        slug?: string;
    };
    variantId: string | null;
    variant?: {
        id: string;
        sku: string;
        combination: Record<string, string>;
    } | null;
    warehouseId: string | null;
    warehouse?: {
        id: string;
        name: string;
        code: string;
    } | null;
    orderId: string | null;
    reservedQty: number;
    fulfilledQty: number;
    releasedQty: number;
    status: 'ACTIVE' | 'FULFILLED' | 'RELEASED' | 'EXPIRED';
    expiresAt: string | null;
    reservedAt: string;
    releasedAt: string | null;
    notes: string | null;
}

export default function StockReservationList() {
    const [reservations, setReservations] = useState<StockReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const { formatPrice } = useSettings();

    // ATP Calculator State
    const [atpProducts, setAtpProducts] = useState<any[]>([]);
    const [atpSearchQuery, setAtpSearchQuery] = useState('');
    const [selectedAtpProduct, setSelectedAtpProduct] = useState<any | null>(null);
    const [selectedAtpVariant, setSelectedAtpVariant] = useState<any | null>(null);
    const [atpPhysicalBalance, setAtpPhysicalBalance] = useState<number>(0);
    const [calculatingAtp, setCalculatingAtp] = useState(false);
    const [atpResult, setAtpResult] = useState<{
        productId: string;
        variantId: string | null;
        physicalBalance: number;
        openReserved: number;
        atp: number;
    } | null>(null);
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    // Fetch Reservations
    const fetchReservations = useCallback(async (page: number, status: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(status !== 'all' && { status })
            });

            const res = await fetchAPI(`/admin/inventory/reservations?${params}`);
            if (res.success) {
                setReservations(res.data.items || []);
                setPagination({
                    page: page,
                    limit: 10,
                    total: res.data.total,
                    totalPages: Math.ceil(res.data.total / 10)
                });
            }
        } catch (error) {
            console.error('Failed to fetch reservations', error);
            toast.error('Failed to load stock reservations');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load and filter change
    useEffect(() => {
        fetchReservations(1, statusFilter);
    }, [statusFilter, fetchReservations]);

    // Fetch products for ATP tool
    useEffect(() => {
        const loadAtpProducts = async () => {
            try {
                const res = await fetchAPI('/products?limit=100');
                if (res.success) {
                    setAtpProducts(res.data.products || []);
                }
            } catch (error) {
                console.error('Failed to fetch ATP products', error);
            }
        };
        loadAtpProducts();
    }, []);

    // Handle Page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchReservations(newPage, statusFilter);
        }
    };

    // Client-side search filtering across loaded items
    const filteredReservations = useMemo(() => {
        if (!searchQuery) return reservations;
        const query = searchQuery.toLowerCase();
        return reservations.filter(r => {
            const matchesProduct = r.product?.name?.toLowerCase().includes(query) || false;
            const matchesSku = r.variant?.sku?.toLowerCase().includes(query) || false;
            const matchesOrderId = r.orderId?.toLowerCase().includes(query) || false;
            const matchesNotes = r.notes?.toLowerCase().includes(query) || false;
            return matchesProduct || matchesSku || matchesOrderId || matchesNotes;
        });
    }, [reservations, searchQuery]);

    // Filter products list for ATP dropdown
    const filteredAtpProducts = useMemo(() => {
        if (!atpSearchQuery) return atpProducts;
        return atpProducts.filter(p => 
            p.name.toLowerCase().includes(atpSearchQuery.toLowerCase()) ||
            p.slug?.toLowerCase().includes(atpSearchQuery.toLowerCase())
        );
    }, [atpProducts, atpSearchQuery]);

    // Check ATP Action
    const handleCalculateAtp = async () => {
        if (!selectedAtpProduct) {
            toast.error('Please select a product first');
            return;
        }
        setCalculatingAtp(true);
        try {
            const params = new URLSearchParams({
                productId: selectedAtpProduct.id,
                ...(selectedAtpVariant && { variantId: selectedAtpVariant.id }),
                physicalBalance: atpPhysicalBalance.toString()
            });

            const res = await fetchAPI(`/admin/inventory/reservations/atp?${params}`);
            if (res) {
                setAtpResult(res);
                toast.success('ATP calculated successfully');
            }
        } catch (error) {
            console.error('Failed to calculate ATP', error);
            toast.error('Error fetching Available-to-Promise data');
        } finally {
            setCalculatingAtp(false);
        }
    };

    // Reset ATP tool
    const handleResetAtp = () => {
        setSelectedAtpProduct(null);
        setSelectedAtpVariant(null);
        setAtpSearchQuery('');
        setAtpPhysicalBalance(0);
        setAtpResult(null);
    };

    // Render Status Badge
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30">
                        <Clock className="w-3.5 h-3.5" />
                        Active
                    </span>
                );
            case 'FULFILLED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Fulfilled
                    </span>
                );
            case 'RELEASED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50">
                        <XCircle className="w-3.5 h-3.5" />
                        Released
                    </span>
                );
            case 'EXPIRED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Expired
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start animate-in fade-in duration-500">
            {/* Left side: Main listing panel */}
            <div className="xl:col-span-3 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <BookmarkCheck className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                            Stock Reservations
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            Manage committed items, prevent stockouts, and inspect ATP status
                        </p>
                    </div>
                    <button 
                        onClick={() => fetchReservations(pagination.page, statusFilter)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh List
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by product, SKU, order ID, notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-medium"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="relative w-full lg:w-56">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-700 dark:text-slate-300"
                        >
                            <option value="all">All Statuses</option>
                            <option value="ACTIVE">Active Reservations</option>
                            <option value="FULFILLED">Fulfilled</option>
                            <option value="RELEASED">Released (Cancelled)</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                        <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reserved Product</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Warehouse</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Ref</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Allocation (Qty)</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lifespan / Dates</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={6} className="px-6 py-8">
                                                <div className="h-10 bg-slate-100 dark:bg-slate-700/30 animate-pulse rounded-xl" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredReservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
                                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-1">
                                                    <Lock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">No Reservations</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        No stock reservations match your current query or filters.
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReservations.map((res) => {
                                        const total = Number(res.reservedQty);
                                        const fulfilled = Number(res.fulfilledQty);
                                        const released = Number(res.releasedQty);
                                        const activeRem = Math.max(0, total - fulfilled - released);
                                        const progressPct = total > 0 ? (fulfilled / total) * 100 : 0;
                                        const releasePct = total > 0 ? (released / total) * 100 : 0;

                                        return (
                                            <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                                {/* Product Info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-600">
                                                            {res.product?.images?.[0] ? (
                                                                <img src={res.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Layers className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
                                                                {res.product?.name}
                                                            </span>
                                                            {res.variant && (
                                                                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 font-mono">
                                                                    SKU: {res.variant.sku} • {Object.entries(res.variant.combination || {}).map(([k, v]) => `${v}`).join(' / ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Warehouse */}
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        {res.warehouse?.name || 'Global'}
                                                    </span>
                                                    {res.warehouse?.code && (
                                                        <span className="block text-[10px] text-slate-400 font-mono">
                                                            Code: {res.warehouse.code}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Order Link */}
                                                <td className="px-6 py-4">
                                                    {res.orderId ? (
                                                        <div className="flex items-center gap-1">
                                                            <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[120px]" title={res.orderId}>
                                                                {res.orderId.slice(0, 8)}...
                                                            </code>
                                                            <a href={`/admin/sales/orders/${res.orderId}`} className="text-slate-400 hover:text-brand-500 transition-colors" title="View Order">
                                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">No Document</span>
                                                    )}
                                                </td>

                                                {/* Quantities & Progress */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1.5 min-w-[140px]">
                                                        <div className="flex items-center justify-between text-[11px] font-extrabold font-mono text-slate-700 dark:text-slate-300">
                                                            <span>Res: {total}</span>
                                                            {fulfilled > 0 && <span className="text-emerald-500">Ful: {fulfilled}</span>}
                                                            {released > 0 && <span className="text-slate-400">Rel: {released}</span>}
                                                        </div>
                                                        {/* Quantity Allocation visual bar */}
                                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden flex">
                                                            {fulfilled > 0 && (
                                                                <div className="h-full bg-emerald-500" style={{ width: `${progressPct}%` }} title={`Fulfilled: ${fulfilled}`} />
                                                            )}
                                                            {released > 0 && (
                                                                <div className="h-full bg-slate-400" style={{ width: `${releasePct}%` }} title={`Released: ${released}`} />
                                                            )}
                                                            {activeRem > 0 && (
                                                                <div className="h-full bg-blue-500" style={{ width: `${(activeRem / total) * 100}%` }} title={`Active Reserve: ${activeRem}`} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    {renderStatusBadge(res.status)}
                                                </td>

                                                {/* Lifespan & Dates */}
                                                <td className="px-6 py-4 text-xs">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{new Date(res.reservedAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {res.expiresAt ? (
                                                            <div className={`flex items-center gap-1 font-bold ${res.status === 'ACTIVE' && new Date(res.expiresAt) < new Date() ? 'text-red-500' : 'text-slate-400'}`}>
                                                                <Clock className="w-3 h-3" />
                                                                <span>Exp: {new Date(res.expiresAt).toLocaleDateString()}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Never Expires</span>
                                                        )}
                                                        {res.notes && (
                                                            <div className="flex items-start gap-1 mt-1 text-[10px] bg-slate-50 dark:bg-slate-900/50 p-1 rounded border border-slate-100 dark:border-slate-800 text-slate-500 max-w-[150px] truncate" title={res.notes}>
                                                                <FileText className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-400" />
                                                                <span>{res.notes}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                            <p className="text-xs text-slate-500 font-black uppercase tracking-wider">
                                Showing page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of <span className="font-bold">{pagination.totalPages}</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: ATP (Available to Promise) Calculator */}
            <div className="xl:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 relative overflow-hidden">
                    {/* Visual decor */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 dark:bg-brand-400/5 rounded-bl-full pointer-events-none" />

                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Lock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                            ATP Simulator
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                            Simulate ATP (Available-to-Promise) in real-time before booking orders.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Product selection input */}
                        <div className="space-y-2 relative">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Select Product
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Type to search..."
                                    value={selectedAtpProduct ? selectedAtpProduct.name : atpSearchQuery}
                                    onChange={(e) => {
                                        setAtpSearchQuery(e.target.value);
                                        if (selectedAtpProduct) {
                                            setSelectedAtpProduct(null);
                                            setSelectedAtpVariant(null);
                                        }
                                        setShowProductDropdown(true);
                                    }}
                                    onFocus={() => setShowProductDropdown(true)}
                                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm font-semibold"
                                />
                                {selectedAtpProduct && (
                                    <button 
                                        onClick={handleResetAtp}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Dropdown menu */}
                            {showProductDropdown && !selectedAtpProduct && atpSearchQuery && (
                                <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-750">
                                    {filteredAtpProducts.length === 0 ? (
                                        <div className="p-3 text-xs text-slate-400 italic text-center">No products match</div>
                                    ) : (
                                        filteredAtpProducts.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedAtpProduct(p);
                                                    setShowProductDropdown(false);
                                                    setAtpSearchQuery('');
                                                }}
                                                className="w-full flex items-center gap-2 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-left transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                                                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">{p.name}</span>
                                                    <span className="text-[10px] text-slate-400 block font-mono">Stock: {p.stock}</span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Variant Selection if any */}
                        {selectedAtpProduct?.variants && selectedAtpProduct.variants.length > 0 && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Select Variant
                                </label>
                                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                                    {selectedAtpProduct.variants.map((v: any) => (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => setSelectedAtpVariant(selectedAtpVariant?.id === v.id ? null : v)}
                                            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black transition-all ${selectedAtpVariant?.id === v.id
                                                ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30'
                                                }`}
                                        >
                                            {Object.entries(v.combination || {}).map(([k, val]) => `${val}`).join('/')} ({v.stock})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Physical Balance Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Physical Balance
                                </label>
                                <span 
                                    onClick={() => {
                                        if (selectedAtpVariant) setAtpPhysicalBalance(Number(selectedAtpVariant.stock));
                                        else if (selectedAtpProduct) setAtpPhysicalBalance(Number(selectedAtpProduct.stock));
                                    }}
                                    className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                                >
                                    Autofill actual
                                </span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                value={atpPhysicalBalance}
                                onChange={(e) => setAtpPhysicalBalance(Math.max(0, Number(e.target.value)))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm font-black font-mono"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleCalculateAtp}
                                disabled={calculatingAtp || !selectedAtpProduct}
                                className="flex-1 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                            >
                                {calculatingAtp ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Lock className="w-4 h-4" />}
                                Compute ATP
                            </button>
                        </div>
                    </div>

                    {/* ATP Output dashboard panel */}
                    <AnimatePresence>
                        {atpResult && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-slate-100 dark:border-slate-700 pt-6 space-y-4"
                            >
                                <div className="text-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                        Available-to-Promise (ATP)
                                    </span>
                                    <span className="text-4xl font-black text-brand-600 dark:text-brand-400 font-mono tracking-tight">
                                        {atpResult.atp}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-1.5 font-medium leading-relaxed">
                                        Units safe to promise for sales
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800 text-center">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Physical</span>
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{atpResult.physicalBalance}</span>
                                    </div>
                                    <div className="bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800 text-center">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Reserved</span>
                                        <span className="text-sm font-extrabold text-amber-500 font-mono">{atpResult.openReserved}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 items-start text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900/10 p-2.5 rounded-lg font-medium leading-relaxed border border-slate-100/50 dark:border-slate-800">
                                    <Info className="w-4.5 h-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <span>
                                        ATP = Physical Balance ({atpResult.physicalBalance}) - Active Reservations ({atpResult.openReserved}).
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
