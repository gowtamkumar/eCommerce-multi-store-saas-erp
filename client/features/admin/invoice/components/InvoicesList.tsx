'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { useDebounce } from '@/hooks/useDebounce';
import { useSettings } from '@/hooks/SettingsContext';
import { useDownloadInvoice } from '@/lib/handleDownloadInvoice';
import { fetchAPI } from '@/services/api';
import dayjs from 'dayjs';
import { Download, Eye, Filter, Receipt, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import InvoiceDetailsModal from './InvoiceDetailsModal';

type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED' | string;

type Invoice = {
    id: string;
    invoiceNumber: string;
    orderId?: string;
    issueDate: string;
    status: InvoiceStatus;
    order?: {
        customerName?: string;
        totalAmount?: number;
    };
};

type InvoiceResponse = {
    items: Invoice[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PAID': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'OVERDUE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'CANCELLED': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
};

export default function InvoicesList() {
    const { formatPrice } = useSettings();
    const { downloadInvoice } = useDownloadInvoice();
    
    // State management
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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
                const data = res.data as InvoiceResponse;
                setInvoices(data.items);
                setPagination({
                    page: data.page,
                    limit: data.limit,
                    total: data.total,
                    totalPages: data.totalPages
                });
            }
        } catch {
            toast.error('Failed to fetch invoices');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void fetchInvoices(1, debouncedSearch, statusFilter);
        }, 0);
        return () => window.clearTimeout(timeout);
    }, [debouncedSearch, statusFilter, fetchInvoices]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchInvoices(newPage, debouncedSearch, statusFilter);
        }
    };

    const handleDownload = useCallback((invoice: Invoice) => {
        downloadInvoice({
            ...invoice.order,
            invoiceNumber: invoice.invoiceNumber
        });
    }, [downloadInvoice]);

    const handleView = useCallback((invoice: Invoice) => {
        setSelectedInvoice(invoice);
    }, []);

    const columns = useMemo<DataTableColumn<Invoice>[]>(() => [
        {
            key: 'invoiceNumber',
            header: 'Invoice Number',
            cell: (invoice) => (
                <span className="font-medium text-slate-900 dark:text-white">
                    {invoice.invoiceNumber}
                </span>
            ),
        },
        {
            key: 'order',
            header: 'Order ID',
            className: 'text-slate-600 dark:text-slate-300',
            cell: (invoice) => `#${invoice.orderId?.slice(-6).toUpperCase() || 'N/A'}`,
        },
        {
            key: 'customer',
            header: 'Customer',
            className: 'text-slate-600 dark:text-slate-300',
            cell: (invoice) => invoice.order?.customerName || 'N/A',
        },
        {
            key: 'issueDate',
            header: 'Issue Date',
            className: 'text-slate-600 dark:text-slate-300',
            cell: (invoice) => dayjs(invoice.issueDate).format('MMM D, YYYY'),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (invoice) => (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                </span>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            className: 'font-medium text-slate-900 dark:text-white',
            cell: (invoice) => formatPrice(invoice.order?.totalAmount || 0),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (invoice) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => handleView(invoice)}
                        className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="View Details"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDownload(invoice)}
                        className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Download PDF"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], [formatPrice, handleDownload, handleView]);

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

            <DataTable
                data={invoices}
                columns={columns}
                getRowKey={(invoice) => invoice.id}
                loading={isLoading}
                loadingLabel="Loading invoices..."
                emptyLabel="No invoices found matching your criteria"
                pagination={{
                    page: pagination.page,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange: handlePageChange,
                }}
                paginationSummary={
                    <p className="text-sm text-slate-500">
                        Showing page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span>
                    </p>
                }
            />

            {selectedInvoice && (
                <InvoiceDetailsModal
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
}
