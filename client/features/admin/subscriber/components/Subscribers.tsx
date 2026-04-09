'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Download, Loader2, Mail, Search, XCircle } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pagination } from '../../customer/type';

interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

const SubscriberRow = memo(({ subscriber }: { subscriber: Subscriber }) => {
    return (
        <motion.tr
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group"
        >
            <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {new Date(subscriber.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
                        <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{subscriber.email}</span>
                </div>
            </td>
            <td className="px-6 py-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${subscriber.isActive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50'
                    }`}>
                    {subscriber.isActive ? (
                        <>
                            <CheckCircle className="w-3 h-3" />
                            Active
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3 h-3" />
                            Inactive
                        </>
                    )}
                </span>
            </td>
        </motion.tr>
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
        limit: 10,
        totalPages: 1
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchSubscribers = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: search
            });
            const res = await fetchAPI(`/subscribers?${params}`);
            if (res) {
                const data = res.data || [];
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
        const exportToast = toast.loading('Preparing export data...');
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '5000',
                search: debouncedSearch
            });
            const res = await fetchAPI(`/subscribers?${params}`);
            if (res && res.data) {
                const data = res.data;
                const headers = ['Date', 'Email', 'Status'];
                const csvContent = [
                    headers.join(','),
                    ...data.map((s: Subscriber) => [
                        new Date(s.createdAt).toISOString(),
                        `"${s.email}"`,
                        s.isActive ? 'Active' : 'Inactive'
                    ].join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Successfully exported ' + data.length + ' subscribers', { id: exportToast });
            }
        } catch (error) {
            toast.error('Export failed', { id: exportToast });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
                        <Mail className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">Neural Subscribers</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your boutique's newsletter network cluster.</p>
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-none font-bold text-sm uppercase tracking-widest"
                >
                    <Download className="w-4 h-4" />
                    Export Dataset
                </button>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan identities by email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-medium"
                    />
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Node Count: {pagination.total}
                    </span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Mail</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pulse State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-300">Synchronizing records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-24 text-center">
                                        <p className="text-sm font-black uppercase tracking-widest text-slate-300">
                                            {searchQuery ? 'Zero identity matches' : 'Neural repository empty'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {subscribers.map((subscriber) => (
                                        <SubscriberRow key={subscriber.id} subscriber={subscriber} />
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-700 flex justify-center items-center gap-4">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1 || loading}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Sector {pagination.page} <span className="mx-1 opacity-30">/</span> {pagination.totalPages}
                            </span>
                        </div>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages || loading}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
