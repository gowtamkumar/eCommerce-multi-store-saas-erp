'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { LeadStatus } from '@/lib/enums/lead-status.enum';
import { fetchAPI } from '@/services/api';
import { Download, Filter, Loader2, MessageSquare, Search } from 'lucide-react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Pagination } from '../../customer/type';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

export default function Lead() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchMessages = useCallback(async (page: number, search: string, status: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search: search,
                status: status
            });
            const res = await fetchAPI(`/leads?${params}`);
            if (res.success && res.data) {
                const data = Array.isArray(res.data) ? res.data : (res.data.leads || []);
                setMessages(data);
                if (res.pagination) {
                    setPagination(res.pagination);
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages(1, debouncedSearch, statusFilter);
    }, [debouncedSearch, statusFilter, fetchMessages]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchMessages(newPage, debouncedSearch, statusFilter);
        }
    }, [pagination?.totalPages, debouncedSearch, statusFilter, fetchMessages]);

    const handleStatusUpdate = useCallback(async (id: string, newStatus: string) => {
        setUpdatingStatus(id);
        try {
            const res = await fetchAPI(`/leads/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });

            if (res.success) {
                toast.success('Status updated');
                setMessages((prev: any) =>
                    prev.map((m: any) => (m.id === id ? { ...m, status: newStatus } : m))
                );
            } else {
                toast.error('Update failed');
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(null);
        }
    }, []);

    const handleExport = async () => {
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '5000',
                search: debouncedSearch,
                status: statusFilter
            });
            const res = await fetchAPI(`/leads?${params}`);

            if (res.success && res.data) {
                const leads = res.data.leads;
                const headers = ['Date', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status'];
                const csvContent = [
                    headers.join(','),
                    ...leads.map((lead: any) => [
                        new Date(lead.createdAt).toLocaleDateString(),
                        `"${lead.name?.replace(/"/g, '""') || ''}"`,
                        `"${lead.email?.replace(/"/g, '""') || ''}"`,
                        `"${lead.phone?.replace(/"/g, '""') || ''}"`,
                        `"${lead.subject?.replace(/"/g, '""') || ''}"`,
                        `"${lead.message?.replace(/"/g, '""') || ''}"`,
                        lead.status?.toUpperCase() || ''
                    ].join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `newsletter_export_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Newsletter exported successfully');
            }
        } catch (error) {
            console.error('Export failed', error);
            toast.error('Failed to export leads');
        }
    };

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case LeadStatus.NEW:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case LeadStatus.CONTACTED:
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case LeadStatus.CONVERTED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    }, []);

    const columns = useMemo<DataTableColumn<any>[]>(() => [
        {
            key: 'createdAt',
            header: 'Date',
            className: 'px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap',
            cell: (msg) => new Date(msg.createdAt).toLocaleDateString(),
        },
        {
            key: 'name',
            header: 'Name',
            className: 'px-6 py-4',
            cell: (msg) => (
                <div>
                    <div className="font-medium text-slate-900 dark:text-white">{msg.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{msg.email}</div>
                </div>
            ),
        },
        {
            key: 'phone',
            header: 'Phone',
            className: 'px-6 py-4 text-slate-900 dark:text-white',
            cell: (msg) => msg.phone,
        },
        {
            key: 'subject',
            header: 'Subject',
            className: 'px-6 py-4 text-slate-900 dark:text-white',
            cell: (msg) => msg.subject,
        },
        {
            key: 'message',
            header: 'Message',
            className: 'px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate',
            cell: (msg) => (
                <span title={msg.message}>
                    {msg.message}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            className: 'px-6 py-4',
            cell: (msg) => (
                <div className="flex items-center gap-2">
                    <select
                        value={msg.status}
                        onChange={(e) => handleStatusUpdate(msg.id, e.target.value)}
                        disabled={updatingStatus === msg.id}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border-none cursor-pointer focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none ${getStatusColor(msg.status)}`}
                    >
                        {Object.values(LeadStatus).map((status) => (
                            <option key={status} value={status} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                {status.toUpperCase()}
                            </option>
                        ))}
                    </select>
                    {updatingStatus === msg.id && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                </div>
            ),
        },
    ], [updatingStatus, handleStatusUpdate, getStatusColor]);

    const dataTablePagination = useMemo(() => ({
        page: pagination.page || 1,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 1,
        onPageChange: handlePageChange,
    }), [pagination, handlePageChange]);

    const dataTablePaginationSummary = useMemo(() => (
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
            Page {pagination.page || 1} of {pagination.totalPages || 1}
        </span>
    ), [pagination]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                        <MessageSquare className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Newsletter</h1>
                        <p className="text-slate-500 dark:text-slate-400">View newsletter subscribers</p>
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
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Leads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>
                    <div className="relative min-w-[160px]">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none transition-all cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            {Object.values(LeadStatus).map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    Total: {pagination?.total || 0} subscribers
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <DataTable
                    data={messages}
                    columns={columns}
                    getRowKey={(msg) => msg.id}
                    loading={loading}
                    loadingLabel="Loading subscribers..."
                    emptyLabel={
                        searchQuery ? 'No subscribers match your search.' : 'No subscribers found.'
                    }
                    containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                    rowClassName="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    pagination={dataTablePagination}
                    paginationSummary={dataTablePaginationSummary}
                />
            </div>
        </div>
    );
}
