'use client';

import { useSettings } from '@/hooks/SettingsContext';
import dayjs from 'dayjs';
import { Download, Eye, Receipt, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback, memo } from 'react';
import toast from 'react-hot-toast';
import { useDownloadInvoice } from '@/lib/handleDownloadInvoice';
import { fetchAPI } from '@/services/api';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import { useDebounce } from '@/hooks/useDebounce';

// Memoized Invoice Row component to prevent full table re-renders
const InvoiceRow = memo(({ invoice, onView, onDownload, formatPrice }: { 
    invoice: any, 
    onView: (inv: any) => void, 
    onDownload: (inv: any) => void,
    formatPrice: (val: number) => string 
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'OVERDUE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'CANCELLED': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
        }
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="p-4">
                <span className="font-medium text-slate-900 dark:text-white">
                    {invoice.invoiceNumber}
                </span>
            </td>
            <td className="p-4 text-slate-600 dark:text-slate-300">
                #{invoice.orderId?.slice(-6).toUpperCase() || 'N/A'}
            </td>
            <td className="p-4 text-slate-600 dark:text-slate-300">
                {invoice.order?.customerName || 'N/A'}
            </td>
            <td className="p-4 text-slate-600 dark:text-slate-300">
                {dayjs(invoice.issueDate).format('MMM D, YYYY')}
            </td>
            <td className="p-4">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                </span>
            </td>
            <td className="p-4 font-medium text-slate-900 dark:text-white">
                {formatPrice(invoice.order?.totalAmount || 0)}
            </td>
            <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => onView(invoice)}
                        className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="View Details"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDownload(invoice)}
                        className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Download PDF"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
});

InvoiceRow.displayName = 'InvoiceRow';

export default function InvoicesList() {
    const { formatPrice } = useSettings();
    const { downloadInvoice } = useDownloadInvoice();
    
    // State management
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchInvoices = useCallback(async (page: number, search: string, status: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { q: search }),
                ...(status && { status })
            });

            const res = await fetchAPI(`/invoices?${params}`);
            
            if (res.success && res.data) {
                setInvoices(res.data.items);
                setPagination({
                    page: res.data.page,
                    limit: res.data.limit,
                    total: res.data.total,
                    totalPages: res.data.totalPages
                });
            }
        } catch (error) {
            toast.error('Failed to fetch invoices');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices(1, debouncedSearch, statusFilter);
    }, [debouncedSearch, statusFilter, fetchInvoices]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchInvoices(newPage, debouncedSearch, statusFilter);
        }
    };

    const handleDownload = useCallback((invoice: any) => {
        downloadInvoice({
            ...invoice.order,
            invoiceNumber: invoice.invoiceNumber
        });
    }, [downloadInvoice]);

    const handleView = useCallback((invoice: any) => {
        setSelectedInvoice(invoice);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-brand-600" />
                        Invoices
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage customer invoices</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by invoice number or customer..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
                                <th className="p-4 font-medium">Invoice Number</th>
                                <th className="p-4 font-medium">Order ID</th>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Issue Date</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Amount</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                            <span>Loading invoices...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-500">No invoices found matching your criteria</td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <InvoiceRow 
                                        key={invoice.id} 
                                        invoice={invoice} 
                                        onView={handleView}
                                        onDownload={handleDownload}
                                        formatPrice={formatPrice}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!isLoading && pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Showing page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedInvoice && (
                <InvoiceDetailsModal
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
}
