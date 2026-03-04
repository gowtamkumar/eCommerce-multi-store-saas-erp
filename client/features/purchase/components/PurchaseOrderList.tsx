'use client';

import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { ShoppingBag, Search, Plus, Eye, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PurchaseOrderList() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { formatPrice } = useSettings();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetchAPI('/purchase-orders');
            setOrders(Array.isArray(res) ? res : (res.data || []));
        } catch (error) {
            console.error('Failed to fetch purchase orders', error);
            toast.error('Failed to load purchase orders');
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async (id: string) => {
        const toastId = toast.loading('Receiving order and updating stock...');
        try {
            await fetchAPI(`/purchase-orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'RECEIVED' })
            });
            toast.success('Order received! Inventory updated.', { id: toastId });
            fetchOrders();
        } catch (error) {
            toast.error('Failed to receive order', { id: toastId });
        }
    };

    const filteredOrders = orders.filter(o =>
        o.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT': return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 uppercase">Draft</span>;
            case 'PENDING': return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-600 uppercase">Pending</span>;
            case 'RECEIVED': return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-600 uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Received</span>;
            case 'CANCELLED': return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-600 uppercase flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
            default: return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 uppercase">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Purchase Orders</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage procurement and supplier orders</p>
                </div>
                <Link
                    href="/admin/purchases/new"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Order
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by reference # or supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Reference #</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Supplier</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Total</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        {searchQuery ? 'No orders match your search.' : 'No purchase orders found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                                                    <FileText className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="text-slate-900 dark:text-white font-medium">{order.referenceNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {order.supplier?.name}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {formatPrice(order.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/purchases/${order.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {order.status !== 'RECEIVED' && order.status !== 'CANCELLED' && (
                                                    <button
                                                        onClick={() => handleReceive(order.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                        title="Mark as Received"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
