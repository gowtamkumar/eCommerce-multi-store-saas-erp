'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';

export interface FulfillmentTask {
    id: string;
    createdAt: string;
    status: string;
    order?: {
        id: string;
        customerName?: string;
    };
    assignedToUser?: {
        name?: string;
    };
    items?: unknown[];
}

export function useFulfillmentList() {
    const [tasks, setTasks] = useState<FulfillmentTask[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAPI('/operations/logistics/fulfillment');
            if (data?.success || Array.isArray(data?.data) || Array.isArray(data)) {
                setTasks(data.data || data || []);
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
            toast.error('Failed to load fulfillment tasks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTasks();
    }, [loadTasks]);

    return {
        tasks,
        loading,
        loadTasks,
    };
}
