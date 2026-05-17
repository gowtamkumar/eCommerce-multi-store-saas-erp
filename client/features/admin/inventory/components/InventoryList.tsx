'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useSettings as useLocalSettings } from '@/hooks/SettingsContext'; // Re-importing to ensure access if needed
import { 
    Plus, Search, Package, ArrowUpCircle, ArrowDownCircle, 
    ChevronLeft, ChevronRight, Loader2, Filter
} from 'lucide-react';
import { useEffect, useState, memo, useCallback } from 'react';
import toast from 'react-hot-toast';
import StockAdjustmentModal from './StockAdjustmentModal';
import { fetchAPI } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';

// Memoized Transaction Row component to prevent full table re-renders
const TransactionRow = memo(({ transaction }: { transaction: any }) => {
    const isPositive = [
        'PURCHASE', 'RETURN', 'INITIAL_BALANCE', 'TRANSFER_IN'
    ].includes(transaction.type) || (transaction.type === 'ADJUSTMENT' && transaction.quantity > 0);

    const typeLabels: Record<string, string> = {
        PURCHASE: 'Purchase',
        SALE: 'Sale',
        TRANSFER_IN: 'Transfer In',
        TRANSFER_OUT: 'Transfer Out',
        ADJUSTMENT: 'Adjustment',
        RETURN: 'Return',
        DAMAGE: 'Damage',
        INITIAL_BALANCE: 'Initial'
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {new Date(transaction.createdAt).toLocaleString()}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <Package className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-slate-900 dark:text-white font-medium block">
                            {transaction.product?.name}
                        </span>
                        {transaction.variant && (
                            <span className="text-[10px] text-slate-400 font-mono">
                                {Object.entries(transaction.variant.combination || {}).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {transaction.warehouse?.name || 'Global'}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className={`flex items-center gap-1.5 font-medium ${
                    isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                    {isPositive ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                    {typeLabels[transaction.type] || transaction.type}
                </div>
            </td>
            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded-lg w-fit">
                    {transaction.balanceAfter}
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {transaction.referenceType}
                </span>
            </td>
            <td className="px-6 py-4">
                <code className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400 font-mono">
                    {transaction.referenceId || 'N/A'}
                </code>
            </td>
        </tr>
    );
});

TransactionRow.displayName = 'TransactionRow';

export default function InventoryList() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchWarehouses = useCallback(async () => {
        try {
            const res = await fetchAPI('/system/warehouses');
            if (res.success) setWarehouses(res.data || []);
        } catch (error) {
            console.error('Failed to fetch warehouses', error);
        }
    }, []);

    const fetchTransactions = useCallback(async (page: number, search: string, type: string, warehouseId: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { q: search }),
                ...(type && { type }),
                ...(warehouseId && { warehouseId })
            });

            const res = await fetchAPI(`/inventory-ledger?${params}`);
            if (res.success) {
                setTransactions(res.data.items);
                setPagination({
                    page: res.data.page,
                    limit: res.data.limit,
                    total: res.data.total,
                    totalPages: res.data.totalPages
                });
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
            toast.error('Failed to load inventory transactions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    useEffect(() => {
        fetchTransactions(1, debouncedSearch, typeFilter, warehouseFilter);
    }, [debouncedSearch, typeFilter, warehouseFilter, fetchTransactions]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchTransactions(newPage, debouncedSearch, typeFilter, warehouseFilter);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Inventory History</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track stock movements across all products</p>
                </div>
                <button
                    onClick={() => setIsAdjustmentModalOpen(true)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-brand-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Log Transaction
                </button>
            </div>

            <StockAdjustmentModal 
                isOpen={isAdjustmentModalOpen}
                onClose={() => setIsAdjustmentModalOpen(false)}
                onSuccess={() => fetchTransactions(1, debouncedSearch, typeFilter, warehouseFilter)}
            />

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by product or reference ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="PURCHASE">Purchase</option>
                        <option value="SALE">Sale</option>
                        <option value="TRANSFER_IN">Transfer In</option>
                        <option value="TRANSFER_OUT">Transfer Out</option>
                        <option value="DAMAGE">Damage</option>
                    </select>
                </div>
                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={warehouseFilter}
                        onChange={(e) => setWarehouseFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All Warehouses</option>
                        {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Warehouse</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ref Type</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ref ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                            <span>Loading history...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500 font-medium">
                                        {searchQuery || typeFilter ? 'No records match your criteria.' : 'No inventory records found.'}
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <TransactionRow key={t.id} transaction={t} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of <span className="font-bold">{pagination.totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
