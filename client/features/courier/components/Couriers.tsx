'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import {
    Truck,
    ExternalLink,
    Box,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Couriers() {
    const { settings, formatPrice } = useSettings();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTrackedOrders();
    }, []);

    const fetchTrackedOrders = async () => {
        try {
            setLoading(true);
            // Fetch recent orders - in a real app we might have a specific endpoint for courier-tracked orders
            const res = await fetchAPI('/orders?limit=100');
            if (res.success && res.data) {
                // Filter orders that have tracking information or courier status
                const tracked = res.data.orders.filter((o: any) => o.trackingId || o.courierStatus);
                setOrders(tracked);
            }
        } catch (error) {
            console.error('Failed to fetch tracked orders', error);
            toast.error('Failed to load courier activity');
        } finally {
            setLoading(false);
        }
    };

    const isPathaoConnected = !!(settings?.pathaoCourier?.pathaoClientId && settings?.pathaoCourier?.pathaoStoreId);
    const isSteadfastConnected = !!(settings?.steadfastCourier?.apiKey);

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.trackingId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Couriers & Logistics</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage shipping integrations and track deliveries</p>
                </div>
                <Link
                    href="/admin/settings?tab=courier"
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Courier Settings
                </Link>
            </div>

            {/* Integration Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pathao</h3>
                                <p className="text-xs text-slate-500">Logistics & Delivery</p>
                            </div>
                        </div>
                        {isPathaoConnected ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Connected
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                <XCircle className="w-3.5 h-3.5" />
                                Not Configured
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        Automate your deliveries with Pathao. Create orders directly from your dashboard and track them in real-time.
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://merchant.pathao.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 uppercase tracking-widest"
                        >
                            Merchant Panel <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Steadfast</h3>
                                <p className="text-xs text-slate-500">Courier Service</p>
                            </div>
                        </div>
                        {isSteadfastConnected ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Connected
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                <XCircle className="w-3.5 h-3.5" />
                                Not Configured
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        Reliable nationwide delivery with Steadfast Courier. Simplifies your shipment process with direct integration.
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://steadfast.com.bd/login"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 uppercase tracking-widest"
                        >
                            Merchant Panel <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Tracking Activity */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer or tracking..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Courier</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tracking ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center gap-2 text-slate-500">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Loading activity...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                            {searchQuery ? 'No matching tracked orders found.' : 'No courier activity recorded yet.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="font-bold text-slate-900 dark:text-white hover:text-brand-600 transition-colors"
                                                >
                                                    #{order.id.slice(-8).toUpperCase()}
                                                </Link>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900 dark:text-white">{order.customerName}</p>
                                                <p className="text-xs text-slate-500">{order.customerPhone}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.courierStatus === 'Pathao' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {order.courierStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                                                {order.trackingId || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase">
                                                    Shipped
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.trackingId && (
                                                    <a
                                                        href={order.courierStatus?.toLowerCase() === 'pathao' ? 'https://tracking.pathao.com/' : 'https://steadfast.com.bd/tracking'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                                                        title="Track Shipment"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
