'use client';

import { fetchAPI } from '@/services/api';
import { ChevronLeft, ChevronRight, Download, Loader2, Mail, Search } from 'lucide-react';
import React, { useEffect, useState, useCallback, memo } from 'react';
import toast from 'react-hot-toast';
import { Pagination } from '../../customer/type';
import { useDebounce } from '@/hooks/useDebounce';

interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

const SubscriberRow = memo(({ subscriber }: { subscriber: Subscriber }) => {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {new Date(subscriber.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
                <div className="font-medium text-slate-900 dark:text-white">{subscriber.email}</div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${subscriber.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400'
                    }`}>
                    {subscriber.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
        </tr>
    );
});
SubscriberRow.displayName = 'SubscriberRow';

export default function Subscribers() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchSubscribers = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search: search
            });
            const res = await fetchAPI(`/subscribers?${params}`);
            if (res) {
                const data = Array.isArray(res) ? res : res.data || [];
                setSubscribers(data);
                if (res.pagination) setPagination(res.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch subscribers', error);
            toast.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscribers(1, debouncedSearch);
    }, [debouncedSearch, fetchSubscribers]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchSubscribers(newPage, debouncedSearch);
        }
    }, [pagination.totalPages, debouncedSearch, fetchSubscribers]);

    const handleExport = async () => {
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '5000',
                search: debouncedSearch
            });
            const res = await fetchAPI(`/subscribers?${params}`);
            if (res && res.data) {
                const leads = Array.isArray(res) ? res : res.data;
                const headers = ['Date', 'Email', 'Status'];
                const csvContent = [
                    headers.join(','),
                    ...leads.map((s: Subscriber) => [
                        new Date(s.createdAt).toLocaleDateString(),
                        `"${s.email}"`,
                        s.isActive ? 'Active' : 'Inactive'
                    ].join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `subscribers_export_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Subscribers exported successfully');
            }
        } catch (error) {
            console.error('Export failed', error);
            toast.error('Failed to export leads');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                        <Mail className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Subscribers</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage your newsletter subscribers</p>
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 font-medium"
                >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Export CSV</span>
                </button>
            </div>

            <div className="mb-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Subscribers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    Total: {pagination.total} subscribers
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Email</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Loading subscribers...
                                        </div>
                                    </td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        {searchQuery ? 'No subscribers match your search.' : 'No subscribers found.'}
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map((subscriber) => (
                                    <SubscriberRow key={subscriber.id} subscriber={subscriber} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>

                    <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                    </div>

                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || loading}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            )}
        </div>
    );
}
