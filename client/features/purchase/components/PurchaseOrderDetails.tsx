'use client';

import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { ChevronLeft, Package, Truck, Calendar, FileText, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PurchaseOrderDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { formatPrice } = useSettings();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetchAPI(`/purchase-orders/${id}`);
            setOrder(res.data || res);
        } catch (error) {
            console.error('Failed to fetch purchase order', error);
            toast.error('Failed to load purchase order details');
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async () => {
        const toastId = toast.loading('Receiving order and updating stock...');
        try {
            await fetchAPI(`/purchase-orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'RECEIVED' })
            });
            toast.success('Order received! Inventory updated.', { id: toastId });
            fetchOrder();
        } catch (error) {
            toast.error('Failed to receive order', { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Order not found</h2>
                <Link href="/admin/purchases" className="text-brand-600 hover:underline mt-4 inline-block">Back to purchases</Link>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">DRAFT</span>;
            case 'PENDING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600">PENDING</span>;
            case 'RECEIVED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> RECEIVED</span>;
            case 'CANCELLED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> CANCELLED</span>;
            default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/purchases" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Order {order.referenceNumber}</h1>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Ordered on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {order.status !== 'RECEIVED' && order.status !== 'CANCELLED' && (
                        <button
                            onClick={handleReceive}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/25 flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Mark as Received
                        </button>
                    )}
                    {getStatusBadge(order.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items Table */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Package className="w-5 h-5 text-brand-500" /> Order Items
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Product</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Qty</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Unit Price</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {order.items?.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                {item.product?.name || 'Unknown Product'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 text-center">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 text-right font-mono">
                                                {formatPrice(item.unitPrice)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right font-mono">
                                                {formatPrice(item.quantity * item.unitPrice)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex justify-end gap-20">
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 mb-1">Total Items</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{order.items?.length || 0}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                                    <p className="text-3xl font-black text-brand-600 dark:text-brand-400 tracking-tight">{formatPrice(order.totalAmount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Supplier Info */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-700 pb-4">
                            <Truck className="w-5 h-5 text-brand-500" /> Supplier Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</p>
                                <p className="text-slate-900 dark:text-white font-medium">{order.supplier?.name}</p>
                            </div>
                            {order.supplier?.contactName && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Person</p>
                                    <p className="text-slate-900 dark:text-white">{order.supplier.contactName}</p>
                                </div>
                            )}
                            {order.supplier?.email && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-brand-600 dark:text-brand-400">{order.supplier.email}</p>
                                </div>
                            )}
                            {order.supplier?.phone && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                                    <p className="text-slate-900 dark:text-white">{order.supplier.phone}</p>
                                </div>
                            )}
                            {order.supplier?.address && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                                    <p className="text-slate-900 dark:text-white text-sm leading-relaxed">{order.supplier.address}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-4">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-brand-500" /> Internal Notes
                        </h4>
                        <p className="text-sm text-slate-500 italic">No internal notes for this purchase order.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
