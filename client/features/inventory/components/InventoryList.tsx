'use client';

import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { Package, Search, ArrowUpCircle, ArrowDownCircle, History, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import StockAdjustmentModal from './StockAdjustmentModal';

export default function InventoryList() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const { formatPrice } = useSettings();

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetchAPI('/inventory-transactions');
            if (res.success) {
                setTransactions(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
            toast.error('Failed to load inventory transactions');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.referenceType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Inventory History</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track stock movements across all products</p>
                </div>
                <button
                    onClick={() => setIsAdjustmentModalOpen(true)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Log Transaction
                </button>
            </div>

            <StockAdjustmentModal 
                isOpen={isAdjustmentModalOpen}
                onClose={() => setIsAdjustmentModalOpen(false)}
                onSuccess={fetchTransactions}
            />

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by product, reference ID or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Product</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Type</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Quantity</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Reference</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Ref ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading history...</td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        {searchQuery ? 'No records match your search.' : 'No inventory records found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(t.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                                                    <Package className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="text-slate-900 dark:text-white font-medium">{t.product?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-1.5 font-medium ${t.type === 'IN' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {t.type === 'IN' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                                                {t.type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {t.type === 'IN' ? '+' : '-'}{t.quantity}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                                {t.referenceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                                {t.referenceId || 'N/A'}
                                            </code>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
