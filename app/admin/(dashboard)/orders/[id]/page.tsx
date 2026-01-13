'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { fetchAPI } from '@/lib/api';
import { OrderStatus } from '@/lib/enums/order-status';
import { PaymentStatus } from '@/lib/enums/payment-status';
import { ArrowLeft, Calendar, CreditCard, FileText, Mail, MapPin, Package, Phone } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
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
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  } | null;
  quantity: number;
  createdAt: string;
  orderNotes?: string;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { settings, formatPrice } = useSettings();

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetchAPI(`/orders/${id}`);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch order', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (updates: any) => {
    setUpdating(true);
    try {
      const res = await fetchAPI(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (res.success && res.data) {
        setOrder(res.data);
        toast.success('Order updated successfully');
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      toast.error('Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case OrderStatus.COMPLETED: return <CheckCircle className="w-5 h-5 text-green-500" />;
  //     case OrderStatus.CANCELLED: return <XCircle className="w-5 h-5 text-red-500" />;
  //     default: return <Clock className="w-5 h-5 text-yellow-500" />;
  //   }
  // };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Order not found.</p>
        <Link href="/admin/orders" className="text-brand-600 hover:underline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Print-only Invoice */}
      <div className="hidden print:block bg-white p-8 text-black">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Invoice</h1>
            <p className="text-slate-500 font-mono">#{order.id?.slice(-8)?.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-brand-600">{settings?.brandName || 'Store'}</h2>
            <p className="text-sm text-slate-500 max-w-[200px] ml-auto">
              {settings?.address}
            </p>
            <p className="text-sm text-slate-500">{settings?.contactEmail}</p>
            <p className="text-sm text-slate-500">{settings?.contactPhone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Billed To</h3>
            <p className="text-lg font-bold text-slate-900 mb-1">{order.customerName}</p>
            <p className="text-slate-600">{order.customerEmail}</p>
            <p className="text-slate-600 mb-4">{order.customerPhone}</p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mb-1">Shipping Address</p>
              <p className="text-slate-700 leading-relaxed">{order.address}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Order Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 italic">Date</span>
                <span className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 italic">Payment Status</span>
                <span className={`font-bold uppercase ${order.paymentStatus === PaymentStatus.PAID ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 italic">Payment Method</span>
                <span className="font-bold text-slate-900 uppercase">{order.paymentMethod}</span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 italic">TXN ID</span>
                  <span className="font-bold text-slate-900 font-mono">{order.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-left">
              <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900">Description</th>
              <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-center">Qty</th>
              <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-right">Unit Price</th>
              <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-6">
                <p className="font-bold text-slate-900 text-lg mb-1">{order.product?.name || 'Product'}</p>
                <p className="text-sm text-slate-500">Item #{order.product?.id?.slice(-6)?.toUpperCase()}</p>
              </td>
              <td className="py-6 text-center font-bold text-slate-900">{order.quantity}</td>
              <td className="py-6 text-right font-medium text-slate-600">
                {formatPrice(order.unitPrice || order.product?.price || 0)}
              </td>
              <td className="py-6 text-right font-bold text-slate-900">
                {formatPrice((order.unitPrice || order.product?.price || 0) * order.quantity)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-80 space-y-4">
            <div className="flex justify-between text-sm text-slate-500 italic">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">{formatPrice((order.unitPrice || order.product?.price || 0) * order.quantity)}</span>
            </div>
            {(order.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Total Discount</span>
                <span className="font-medium">-{formatPrice((order.discountAmount || 0) * order.quantity)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-4 border-t-2 border-slate-900">
              <span className="text-lg font-bold uppercase tracking-tighter">Grand Total</span>
              <span className="text-3xl font-bold text-green-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-400 italic">Thank you for your business!</p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest">{settings?.brandName}</span>
            <span className="text-[10px] text-slate-300">•</span>
            <span className="text-[10px] text-slate-300 uppercase tracking-widest">E-Commerce Invoice</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
            Order <span className="text-slate-400 font-mono text-2xl uppercase">#{order.id.slice(-8)}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(order.status || 'PENDING')}`}>
              {(order.status || 'PENDING').charAt(0).toUpperCase() + (order.status || 'PENDING').slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Print Order
          </button>
          <select
            value={order.status || OrderStatus.PENDING}
            onChange={(e) => handleStatusUpdate({ status: e.target.value })}
            disabled={updating}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm cursor-pointer border-none outline-none ring-2 ring-slate-100 dark:ring-slate-700 transition-all ${getStatusStyles(order.status || OrderStatus.PENDING)}`}
          >
            <option value={OrderStatus.PENDING}>Mark as Pending</option>
            <option value={OrderStatus.COMPLETED}>Mark as Completed</option>
            <option value={OrderStatus.CANCELLED}>Mark as Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 print:hidden">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items Section */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-500" />
                Order Items
              </h2>
            </div>
            <div className="p-6">
              {order.product ? (
                <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative">
                    <img
                      src={order.product.images?.[0]}
                      alt={order.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link href={`/admin/products/${order.product.id}/review`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-brand-600 transition-colors">
                      {order.product.name}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span>Quantity: {order.quantity}</span>
                      <span>•</span>
                      <span>Unit Price: {formatPrice(order.unitPrice || order.product.price)}</span>
                    </div>
                    {(order.discountAmount || 0) > 0 && (
                      <p className="text-sm text-red-500 font-medium mt-1">
                        Discount: -{formatPrice(order.discountAmount || 0)} per unit
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-brand-600">
                      {formatPrice((+(order.unitPrice || order.product.price) - (+(order.discountAmount || 0))) * order.quantity)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Product data unavailable</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
              <div className="space-y-2 max-w-sm ml-auto">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatPrice((order.unitPrice || order.product?.price || 0) * order.quantity)}</span>
                </div>
                {(order.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Total Discount</span>
                    <span>-{formatPrice((order.discountAmount || 0) * order.quantity)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Paid</span>
                  <span className="text-green-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Order Notes */}
          {order.orderNotes && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                Order Notes
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 p-4 rounded-xl">
                <p className="text-slate-700 dark:text-slate-300 italic">"{order.orderNotes}"</p>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8 print:hidden">
          {/* Customer Info */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Customer Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Package className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Name</p>
                  <p className="font-medium text-slate-900 dark:text-white">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email</p>
                  <p className="font-medium text-slate-900 dark:text-white truncate">{order.customerEmail || 'No email provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Phone className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Phone</p>
                  <p className="font-medium text-slate-900 dark:text-white">{order.customerPhone || 'No phone provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Shipping Address</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                    {order.address}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Info */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Payment Status</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Method</p>
                    <p className="font-medium text-slate-900 dark:text-white uppercase">{order.paymentMethod}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.paymentStatus === PaymentStatus.PAID
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                  }`}>
                  {order.paymentStatus}
                </span>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Payment Status</label>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => handleStatusUpdate({ paymentStatus: e.target.value })}
                    disabled={updating}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  >
                    <option value={PaymentStatus.PENDING}>Pending</option>
                    <option value={PaymentStatus.PAID}>Paid</option>
                    <option value={PaymentStatus.FAILED}>Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transaction ID / Reference</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={order.transactionId || ''}
                      onChange={(e) => setOrder({ ...order, transactionId: e.target.value })}
                      placeholder="Enter ID"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                    <button
                      onClick={() => handleStatusUpdate({ transactionId: order.transactionId })}
                      disabled={updating}
                      className="px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
