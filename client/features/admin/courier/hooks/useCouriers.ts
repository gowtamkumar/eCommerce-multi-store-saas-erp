'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { TrackedOrder } from '../types';

export function useCouriers() {
    const { settings } = useSettings();
    const [orders, setOrders] = useState<TrackedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTrackedOrders = useCallback(async () => {
        try {
            setLoading(true);
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
        void fetchTrackedOrders();
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

    return {
        settings,
        orders: filteredOrders,
        rawOrders: orders,
        loading,
        searchQuery,
        isPathaoConnected,
        isSteadfastConnected,
        fetchTrackedOrders,
        handleSearchChange,
    };
}
