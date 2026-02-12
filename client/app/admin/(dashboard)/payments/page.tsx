'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  order: {
    customerName: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { settings, formatPrice } = useSettings();
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchPayments(1, debouncedSearch);
  }, [debouncedSearch]);

  const fetchPayments = async (page: number, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search
      });
      const res = await fetchAPI(`/payments?${params}`);

      if (res.success && Array.isArray(res.data)) {
        setPayments(res.data);
        // Backend doesn't support pagination yet, so we mock it based on result length
        setPagination({
          total: res.data.length,
          page: 1,
          limit: res.data.length,
          totalPages: 1
        });
      }
    } catch (error) {
      console.error('Failed to fetch payments', error);
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Transaction ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Customer</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Method</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading payments...
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {searchQuery ? 'No payments match your search.' : 'No payments found.'}
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{payment.transactionId}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{payment.order?.customerName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{formatPrice(payment.amount || 0)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">{payment.method}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
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
