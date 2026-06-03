'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { 
    Plus, Search, Package, ArrowUpCircle, ArrowDownCircle, 
    Filter
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import StockAdjustmentModal from './StockAdjustmentModal';

type WarehouseOption = {
    id: string;
    name: string;
};

type InventoryTransaction = {
    id: string;
    createdAt: string;
    type: string;
    quantity: number;
    balanceAfter: number;
    referenceType?: string;
    referenceId?: string;
    product?: {
        name?: string;
    };
    variant?: {
        combination?: Record<string, string>;
    };
    warehouse?: {
        name?: string;
    };
};

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

const isPositiveTransaction = (transaction: InventoryTransaction) => (
    ['PURCHASE', 'RETURN', 'INITIAL_BALANCE', 'TRANSFER_IN'].includes(transaction.type) ||
    (transaction.type === 'ADJUSTMENT' && transaction.quantity > 0)
);

export default function InventoryList() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
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
        const timeout = window.setTimeout(() => {
            void fetchWarehouses();
        }, 0);
        return () => window.clearTimeout(timeout);
    }, [fetchWarehouses]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void fetchTransactions(1, debouncedSearch, typeFilter, warehouseFilter);
        }, 0);
        return () => window.clearTimeout(timeout);
    }, [debouncedSearch, typeFilter, warehouseFilter, fetchTransactions]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchTransactions(newPage, debouncedSearch, typeFilter, warehouseFilter);
        }
    };

    const columns = useMemo<DataTableColumn<InventoryTransaction>[]>(() => [
        {
            key: 'date',
            header: 'Date',
            className: 'text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap',
            cell: (transaction) => new Date(transaction.createdAt).toLocaleString(),
        },
        {
            key: 'product',
            header: 'Product',
            cell: (transaction) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <Package className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-slate-900 dark:text-white font-medium block">
                            {transaction.product?.name || 'Unknown product'}
                        </span>
                        {transaction.variant && (
                            <span className="text-[10px] text-slate-400 font-mono">
                                {Object.entries(transaction.variant.combination || {}).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'warehouse',
            header: 'Warehouse',
            cell: (transaction) => (
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {transaction.warehouse?.name || 'Global'}
                </span>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            cell: (transaction) => {
                const isPositive = isPositiveTransaction(transaction);
                return (
                    <div className={`flex items-center gap-1.5 font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isPositive ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                        {typeLabels[transaction.type] || transaction.type}
                    </div>
                );
            },
        },
        {
            key: 'qty',
            header: 'Qty',
            className: 'font-bold text-slate-900 dark:text-white',
            cell: (transaction) => `${transaction.quantity > 0 ? '+' : ''}${transaction.quantity}`,
        },
        {
            key: 'balance',
            header: 'Balance',
            cell: (transaction) => (
                <div className="text-sm font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded-lg w-fit">
                    {transaction.balanceAfter}
                </div>
            ),
        },
        {
            key: 'referenceType',
            header: 'Ref Type',
            cell: (transaction) => (
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {transaction.referenceType || 'N/A'}
                </span>
            ),
        },
        {
            key: 'referenceId',
            header: 'Ref ID',
            cell: (transaction) => (
                <code className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400 font-mono">
                    {transaction.referenceId || 'N/A'}
                </code>
            ),
        },
    ], []);

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

            <DataTable
                data={transactions}
                columns={columns}
                getRowKey={(transaction) => transaction.id}
                loading={loading}
                loadingLabel="Loading history..."
                emptyLabel={searchQuery || typeFilter ? 'No records match your criteria.' : 'No inventory records found.'}
                pagination={{
                    page: pagination.page,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange: handlePageChange,
                }}
                paginationSummary={
                    <p className="text-sm text-slate-500 font-medium">
                        Showing page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of <span className="font-bold">{pagination.totalPages}</span>
                    </p>
                }
            />
        </div>
    );
}
