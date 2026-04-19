'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { ChevronLeft, ChevronRight, Loader2, Search, ShoppingBag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function CartsList() {
    const { data: session } = useSession();
    const { formatPrice } = useSettings();
    const [carts, setCarts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const fetchCarts = useCallback(async (page: number, search: string) => {
        if (!session?.user?.accessToken) return;
        setLoading(true);
        try {
            const res = await fetchAPI(`/carts?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`);

            if (res.success) {
                setCarts(res.data.carts);
                setPagination(res.data.pagination);
            } else {
                toast.error(res.message || 'Failed to fetch carts');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while fetching carts');
        } finally {
            setLoading(false);
        }
    }, [session, pagination.limit]);

    useEffect(() => {
        fetchCarts(1, debouncedSearch);
    }, [debouncedSearch, fetchCarts]);

    const handlePageChange = (newPage: number) => {
        fetchCarts(newPage, debouncedSearch);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8 relative inline-flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                Active Carts
            </h1>

            {/* Search Bar & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by customer name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Total Users with Cart: <span className="text-slate-900 dark:text-white font-black">{pagination.total}</span>
                    </div>
                </div>
            </div>

            {/* Carts Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500 scrollbar-track-transparent">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Cart ID</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Customer</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center">Items Count</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Rough Value</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Last Modified</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                                            <span className="font-medium">Loading carts...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : carts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                        {searchQuery ? 'No carts match your search query.' : 'No active carts found in the system.'}
                                    </td>
                                </tr>
                            ) : (
                                carts.map((cart) => (
                                    <tr key={cart.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-brand-500 transition-colors">
                                                #{cart.id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {cart.customerName}
                                                </span>
                                                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                                                    {cart.customerEmail || cart.customerPhone || 'Guest Configuration'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                                                {cart.itemCount} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                                {formatPrice(cart.totalAmount || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                            {cart.updatedAt && new Date(cart.updatedAt).toLocaleString(undefined, {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center sm:text-left">
                            Page {pagination.page} of {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1 || loading}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm bg-white dark:bg-slate-800"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages || loading}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm bg-white dark:bg-slate-800"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
