'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { Calendar, CheckCircle, Download, Loader2, Mail, Search, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Pagination } from '../../customer/type';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    status?: 'pending' | 'confirmed' | 'unsubscribed' | 'suppressed';
    source?: string | null;
    confirmedAt?: string | null;
    unsubscribedAt?: string | null;
    createdAt: string;
}

const statusStyles: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50',
    pending: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50',
    unsubscribed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
    suppressed: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50',
};

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
                const headers = ['Date', 'Email', 'Status', 'Source'];
                const csvContent = [
                    headers.join(','),
                    ...data.map((s: Subscriber) => [
                        new Date(s.createdAt).toISOString(),
                        `"${s.email}"`,
                        s.status || (s.isActive ? 'confirmed' : 'unsubscribed'),
                        `"${s.source || ''}"`
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

    const columns = useMemo<DataTableColumn<Subscriber>[]>(() => [
        {
            key: 'createdAt',
            header: 'Timestamp',
            className: 'px-6 py-5',
            cell: (subscriber) => (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {new Date(subscriber.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            ),
        },
        {
            key: 'email',
            header: 'Identity Mail',
            className: 'px-6 py-5',
            cell: (subscriber) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
                        <Mail className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{subscriber.email}</span>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {subscriber.source || 'storefront'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Pulse State',
            className: 'px-6 py-5',
            cell: (subscriber) => {
                const status = subscriber.status || (subscriber.isActive ? 'confirmed' : 'unsubscribed');
                return (
                    <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyles[status] || statusStyles.unsubscribed}`}>
                            {status === 'confirmed' ? (
                                <>
                                    <CheckCircle className="w-3 h-3" />
                                    Confirmed
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-3 h-3" />
                                    {status}
                                </>
                            )}
                        </span>
                        <p className="mt-1 text-[10px] text-slate-400 font-semibold">
                            {subscriber.confirmedAt
                                ? `Confirmed ${new Date(subscriber.confirmedAt).toLocaleDateString()}`
                                : subscriber.unsubscribedAt
                                    ? `Left ${new Date(subscriber.unsubscribedAt).toLocaleDateString()}`
                                    : 'Awaiting opt-in'}
                        </p>
                    </div>
                );
            },
        },
    ], []);

    const dataTablePagination = useMemo(() => ({
        page: pagination.page || 1,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 1,
        onPageChange: handlePageChange,
    }), [pagination, handlePageChange]);

    const dataTablePaginationSummary = useMemo(() => (
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Sector {pagination.page} <span className="mx-1 opacity-30">/</span> {pagination.totalPages}
        </span>
    ), [pagination]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-linear-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
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
                <DataTable
                    data={subscribers}
                    columns={columns}
                    getRowKey={(subscriber) => subscriber.id}
                    loading={loading}
                    loadingLabel="Synchronizing records..."
                    emptyLabel={
                        searchQuery ? 'Zero identity matches' : 'Neural repository empty'
                    }
                    containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                    rowClassName="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group"
                    pagination={dataTablePagination}
                    paginationSummary={dataTablePaginationSummary}
                />
            </div>
        </div>
    );
}
