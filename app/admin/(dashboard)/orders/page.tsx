'use client';

import { fetchAPI } from '@/lib/api';

import { useSettings } from '@/contexts/SettingsContext';
import { useDebounce } from '@/hooks/useDebounce';
import { OrderStatus } from '@/lib/enums/order-status';
import { PaymentStatus } from '@/lib/enums/payment-status';
import { ChevronLeft, ChevronRight, Eye, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  items: any[];
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
  const [selectedOrder, setSelectedOrder] = useState({} as any);
  const [creatingOrder, setCreatingOrder] = useState<string | null>(null);
  const [creatingPathaoOrder, setCreatingPathaoOrder] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<{ [orderId: string]: string }>({});
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [pendingCourierOrder, setPendingCourierOrder] = useState<{ order: Order; courier: string } | null>(null);
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
      const res = await fetchAPI(`/orders?${params}`);

      if (res.data?.orders) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('Failed to load orders');
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
      await fetchAPI(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      setOrders(orders.map((o: any) => o.id === id ? { ...o, status: newStatus } : o));

      if (selectedOrder && selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Error updating status');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const handleCreateSteadfastOrder = async (order: Order) => {
    setCreatingOrder(order.id);
    try {
      // Format phone number to ensure it's 11 digits starting with 0
      let formattedPhone = (order.customerPhone || '').replace(/\D/g, ''); // Remove non-digits

      // Ensure phone starts with 0 and is 11 digits
      if (!formattedPhone.startsWith('0')) {
        formattedPhone = '0' + formattedPhone;
      }
      if (formattedPhone.length > 11) {
        formattedPhone = formattedPhone.slice(0, 11);
      }
      if (formattedPhone.length < 11) {
        // Pad with zeros if too short, or use default
        formattedPhone = '01700000000';
      }

      // Map order data to Steadfast format
      const steadfastOrderData = {
        invoice: order.id.slice(-8).toUpperCase(),
        recipient_name: order.customerName,
        recipient_phone: formattedPhone,
        recipient_address: order.address || 'Address not provided',
        cod_amount: Number(order.totalAmount) || 0, // Ensure it's a number
        item_description: order.items?.map((item: any) =>
          `${item.quantity}x ${item.product?.name || 'Product'}`
        ).join(', ') || 'Order items'
      };

      const response = await fetchAPI('/courier/steadfast/create-order', {
        method: 'POST',
        body: JSON.stringify(steadfastOrderData),
      });

      toast.success('Steadfast order created successfully!');
      console.log('Steadfast order response:', response);
    } catch (error: any) {
      console.error('Failed to create Steadfast order:', error);
      toast.error(error?.message || 'Failed to create Steadfast order. Please check your courier settings.');
    } finally {
      setCreatingOrder(null);
    }
  };

  const handleCreatePathaoOrder = async (order: Order) => {
    setCreatingPathaoOrder(order.id);
    try {
      // Format phone number for Pathao
      let formattedPhone = (order.customerPhone || '').replace(/\D/g, '');
      if (!formattedPhone.startsWith('0')) {
        formattedPhone = '0' + formattedPhone;
      }
      if (formattedPhone.length > 11) {
        formattedPhone = formattedPhone.slice(0, 11);
      }
      if (formattedPhone.length < 11) {
        formattedPhone = '01700000000';
      }

      // Calculate total item quantity and weight
      const totalQuantity = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 1;
      const estimatedWeight = totalQuantity * 0.5; // Estimate 0.5kg per item

      // Map order data to Pathao format
      const pathaoOrderData = {
        store_id: 1, // Default store ID - should be configured in settings
        merchant_order_id: order.id.slice(-8).toUpperCase(),
        recipient_name: order.customerName,
        recipient_phone: formattedPhone,
        recipient_address: order.address || 'Address not provided',
        delivery_type: 48, // 48 for Normal Delivery, 12 for On Demand
        item_type: 2, // 1 for Document, 2 for Parcel
        item_quantity: totalQuantity,
        item_weight: Math.min(estimatedWeight, 10), // Max 10kg
        item_description: order.items?.map((item: any) =>
          `${item.quantity}x ${item.product?.name || 'Product'}`
        ).join(', ') || 'Order items',
        amount_to_collect: Number(order.totalAmount) || 0,
      };

      const response = await fetchAPI('/courier/pathao/create-order', {
        method: 'POST',
        body: JSON.stringify(pathaoOrderData),
      });

      toast.success('Pathao order created successfully!');
      console.log('Pathao order response:', response);
    } catch (error: any) {
      console.error('Failed to create Pathao order:', error);
      toast.error(error?.message || 'Failed to create Pathao order. Please check your courier settings.');
    } finally {
      setCreatingPathaoOrder(null);
    }
  };

  const handleCreateCourierOrder = async (order: Order) => {
    const courier = selectedCourier[order.id] || 'steadfast';

    if (courier === 'steadfast') {
      await handleCreateSteadfastOrder(order);
    } else if (courier === 'pathao') {
      await handleCreatePathaoOrder(order);
    }
  };

  const isCreatingCourierOrder = (orderId: string) => {
    return creatingOrder === orderId || creatingPathaoOrder === orderId;
  };

  const handleCourierSelect = (order: Order, courier: string) => {
    if (courier) {
      setPendingCourierOrder({ order, courier });
      setShowCourierModal(true);
    }
  };

  const handleConfirmCourierOrder = async () => {
    if (pendingCourierOrder) {
      setShowCourierModal(false);
      setSelectedCourier({ ...selectedCourier, [pendingCourierOrder.order.id]: pendingCourierOrder.courier });
      await handleCreateCourierOrder(pendingCourierOrder.order);
      setPendingCourierOrder(null);
    }
  };

  const handleCancelCourierOrder = () => {
    setShowCourierModal(false);
    setPendingCourierOrder(null);
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Courier</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                    {searchQuery ? 'No orders match your search.' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-white font-medium">{order.customerName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">
                        {order.items?.length > 1
                          ? `${order.items[0]?.product?.name} + ${order.items.length - 1} more`
                          : order.items?.[0]?.product?.name || 'No Items'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                      {formatPrice(order.items?.[0]?.unitPrice || 0)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-semibold">{formatPrice(order.totalAmount || 0)}</td>
                    <td className="px-6 py-4">
                      {order.items?.some((i: any) => Number(i.discountAmount) > 0) ? (
                        <span className="text-red-500 text-sm">
                          -{formatPrice(order.items.reduce((acc: number, item: any) => acc + (Number(item.discountAmount) * item.quantity), 0))}
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
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value={OrderStatus.PENDING}>Pending</option>
                        <option value={OrderStatus.COMPLETED}>Completed</option>
                        <option value={OrderStatus.CANCELLED}>Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={selectedCourier[order.id]}
                        onChange={(e) => handleCourierSelect(order, e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer hover:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                      >
                        <option value="">Select Courier</option>
                        <option value="steadfast">🚚 Steadfast</option>
                        <option value="pathao">📦 Pathao</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* <button
                          onClick={() => handleCreateCourierOrder(order)}
                          disabled={isCreatingCourierOrder(order.id)}
                          className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={`Create ${selectedCourier[order.id] === 'pathao' ? 'Pathao' : 'Steadfast'} Order`}
                        >
                          {isCreatingCourierOrder(order.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Truck className="w-4 h-4" />
                          )}
                        </button> */}
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors inline-block"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
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

      {/* Courier Confirmation Modal */}
      {showCourierModal && pendingCourierOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full transform transition-all">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Create {pendingCourierOrder.courier === 'pathao' ? 'Pathao' : 'Steadfast'} Order?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to create a {pendingCourierOrder.courier === 'pathao' ? 'Pathao' : 'Steadfast'} courier order for order <span className="font-mono font-semibold">{pendingCourierOrder.order.id.slice(-6).toUpperCase()}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelCourierOrder}
                disabled={isCreatingCourierOrder(pendingCourierOrder.order.id)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors disabled:opacity-50"
              >
                No
              </button>
              <button
                onClick={handleConfirmCourierOrder}
                disabled={isCreatingCourierOrder(pendingCourierOrder.order.id)}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCreatingCourierOrder(pendingCourierOrder.order.id) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Yes, Create Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
