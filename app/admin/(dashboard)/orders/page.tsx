'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useDebounce } from '@/hooks/useDebounce';
import { OrderStatus } from '@/lib/enums/order-status';
import { PaymentStatus } from '@/lib/enums/payment-status';
import { ChevronLeft, ChevronRight, Eye, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  unitPrice?: number;
  discountAmount?: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  productId: {
    name: string;
    price: number;
    images: string[];
  } | null;
  quantity: number;
  createdAt: string;
  orderNotes?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  const { settings, formatPrice } = useSettings();
  const debouncedSearch = useDebounce(searchQuery, 500);


  useEffect(() => {
    fetchOrders(1, debouncedSearch);
  }, [debouncedSearch]);

  const fetchOrders = async (page: number, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search
      });
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage, debouncedSearch);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        toast.success('Order status updated');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };


  const handlePaymentUpdate = async (id: string, paymentStatus: string, transactionId?: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, transactionId }),
      });

      if (res.ok) {
        setOrders(orders.map(o => o._id === id ? { ...o, paymentStatus, transactionId } : o));
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder({ ...selectedOrder, paymentStatus, transactionId });
        }
        toast.success('Payment details updated successfully');
      } else {
        toast.error('Failed to update payment details');
      }
    } catch (error) {
      toast.error('Error updating payment details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Orders</h1>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Total: {pagination.total} orders
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Order ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Customer</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Unit Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Total</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Discount</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Payment</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Payment Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    {searchQuery ? 'No orders match your search.' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{order.customerName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {formatPrice((order.unitPrice || order.productId?.price) || 0)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-semibold">{formatPrice(order.totalAmount || 0)}</td>
                    <td className="px-6 py-4">
                      {order.discountAmount ? (
                        <span className="text-red-500 text-sm">
                          -{formatPrice((order.discountAmount * order.quantity) || 0)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">{order.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === PaymentStatus.PAID
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : order.paymentStatus === PaymentStatus.FAILED
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {order.paymentStatus || PaymentStatus.PENDING}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value={OrderStatus.PENDING}>Pending</option>
                        <option value={OrderStatus.COMPLETED}>Completed</option>
                        <option value={OrderStatus.CANCELLED}>Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors inline-block"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Order Details</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Order ID: {selectedOrder._id}</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                    <p className="text-slate-900 dark:text-white font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-slate-900 dark:text-white font-medium">{selectedOrder.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="text-slate-900 dark:text-white font-medium">{selectedOrder.customerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Payment Method</p>
                    <p className="text-slate-900 dark:text-white font-medium capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Shipping Address</p>
                  <p className="text-slate-900 dark:text-white font-medium">{selectedOrder.address || 'N/A'}</p>
                </div>
                {selectedOrder.orderNotes && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Order Notes</p>
                    <p className="text-slate-900 dark:text-white italic">"{selectedOrder.orderNotes}"</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Product Details</h3>
                <div className="space-y-2">
                  {selectedOrder.productId ? (
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      {selectedOrder.productId.images?.[0] && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={selectedOrder.productId.images[0]}
                            alt={selectedOrder.productId.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.productId.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {selectedOrder.quantity} x {settings?.currencySymbol || '$'}{(selectedOrder.unitPrice || selectedOrder.productId.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {settings?.currencySymbol || '$'}{((selectedOrder.unitPrice || selectedOrder.productId.price || 0) * selectedOrder.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">Product information unavailable (Product may have been deleted)</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-600 dark:text-slate-400">Subtotal</p>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {settings?.currencySymbol || '$'}{((selectedOrder.unitPrice || selectedOrder.productId?.price || 0) * selectedOrder.quantity).toFixed(2)}
                  </p>
                </div>
                {(selectedOrder.discountAmount || 0) > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-600 dark:text-slate-400">Discount</p>
                    <p className="text-red-500 font-medium">
                      -{settings?.currencySymbol || '$'}{((selectedOrder.discountAmount || 0) * selectedOrder.quantity).toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-600 dark:text-slate-400">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-600 dark:text-slate-400">Order Date</p>
                  <p className="text-slate-900 dark:text-white font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <p className="text-slate-900 dark:text-white">Total Amount</p>
                  <p className="text-green-600 dark:text-green-400">{settings?.currencySymbol || '$'}{selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment Management (COD) */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment Management</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Payment Status</label>
                    <select
                      value={selectedOrder.paymentStatus || 'pending'}
                      onChange={(e) => handlePaymentUpdate(selectedOrder._id, e.target.value, selectedOrder.transactionId)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transaction ID / Note</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedOrder.transactionId || ''}
                        onChange={(e) => setSelectedOrder({ ...selectedOrder, transactionId: e.target.value })}
                        placeholder="Enter transaction ID or note"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={() => handlePaymentUpdate(selectedOrder._id, selectedOrder.paymentStatus || 'pending', selectedOrder.transactionId)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
