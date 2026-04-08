'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import CourierIntegrations from './CourierIntegrations';
import CourierActivityList from './CourierActivityList';

export default function Couriers() {
    const { settings } = useSettings();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTrackedOrders = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch orders that likely have courier interactions
            const res = await fetchAPI('/orders?limit=100');
            if (res.success && res.data) {
                const tracked = res.data.orders.filter((o: any) => o.trackingId || o.courierStatus);
                setOrders(tracked);
            }
        } catch (error) {
            console.error('Failed to fetch tracked orders', error);
            toast.error('Failed to load courier activity');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrackedOrders();
    }, [fetchTrackedOrders]);

    const isPathaoConnected = useMemo(() => 
        !!(settings?.pathaoCourier?.pathaoClientId && settings?.pathaoCourier?.pathaoStoreId),
    [settings?.pathaoCourier]);

    const isSteadfastConnected = useMemo(() => 
        !!(settings?.steadfastCourier?.apiKey),
    [settings?.steadfastCourier]);

    const filteredOrders = useMemo(() => 
        orders.filter(o =>
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.trackingId?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [orders, searchQuery]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Logistics Command</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Cross-platform fulfillment & tracking</p>
                </div>
                <Link
                    href="/admin/settings?tab=courier"
                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                >
                    <ExternalLink className="w-4 h-4" />
                    Configure Partners
                </Link>
            </div>

            {/* Integration Status Cards */}
            <section className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Integration Ecosystem</h2>
                <CourierIntegrations 
                    settings={settings} 
                    isPathaoConnected={isPathaoConnected} 
                    isSteadfastConnected={isSteadfastConnected} 
                />
            </section>

            {/* Tracking Activity */}
            <section>
                <CourierActivityList 
                    orders={filteredOrders}
                    loading={loading}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                />
            </section>
        </div>
    );
}
