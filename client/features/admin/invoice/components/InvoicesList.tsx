'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import dayjs from 'dayjs';
import { Download, Eye, Filter, Receipt, Search } from 'lucide-react';
import { useMemo } from 'react';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import { useInvoicesDashboard } from '../hooks/useInvoicesDashboard';
import { Invoice } from '../types';

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
    
    const {
        invoices,
        isLoading,
        selectedInvoice,
        setSelectedInvoice,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        pagination,
        handlePageChange,
        handleDownload,
        handleView,
    } = useInvoicesDashboard();

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
