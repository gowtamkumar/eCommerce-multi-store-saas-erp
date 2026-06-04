'use client';
import { Pagination } from '@/features/admin/customer/type';
import { useSettings } from '@/hooks/SettingsContext';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { Search } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Payment } from '../type';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { formatPrice } = useSettings();
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const columns = useMemo<DataTableColumn<Payment>[]>(() => [
        {
            key: 'date',
            header: 'Date',
            className: 'text-slate-500 text-sm whitespace-nowrap',
            cell: (payment) => new Date(payment.createdAt).toLocaleDateString(),
        },
        {
            key: 'transactionId',
            header: 'Transaction ID',
            className: 'text-slate-500 font-mono text-xs',
            cell: (payment) => payment.transactionId,
        },
        {
            key: 'customer',
            header: 'Customer',
            className: 'text-slate-900 dark:text-white font-medium',
            cell: (payment) => payment.order?.customerName || 'Unknown',
        },
        {
            key: 'amount',
            header: 'Amount',
            className: 'text-slate-600 dark:text-slate-300 font-medium',
            cell: (payment) => formatPrice(payment.amount || 0),
        },
        {
            key: 'method',
            header: 'Method',
            className: 'text-slate-600 dark:text-slate-300 capitalize',
            cell: (payment) => payment.method,
        },
        {
            key: 'status',
            header: 'Status',
            cell: (payment) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    payment.status === 'completed' || payment.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                    {payment.status}
                </span>
            ),
        },
    ], [formatPrice]);

    useEffect(() => {
        fetchPayments(1, debouncedSearch);
    }, [debouncedSearch]);

    const fetchPayments = async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                q: search,
            });
            const res = await fetchAPI(`/payments?${params}`);

            if (res.success && res.data?.items) {
                setPayments(res.data.items);
                setPagination({
                    total: res.data.total,
                    page: res.data.page,
                    limit: res.data.limit,
                    totalPages: res.data.totalPages,
                });
            }
        } catch (error) {
            console.error('Failed to fetch payments', error);
            toast.error('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchPayments(newPage, debouncedSearch);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Payments</h1>

            {/* Search Bar */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search payments (ID, Method, Status)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Total: {pagination.total} payments
                </div>
            </div>

            <DataTable
                data={payments}
                columns={columns}
                getRowKey={(payment) => payment.id}
                loading={loading}
                loadingLabel="Loading payments..."
                emptyLabel="No payments found matching your criteria."
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
        </div>
    );
}
