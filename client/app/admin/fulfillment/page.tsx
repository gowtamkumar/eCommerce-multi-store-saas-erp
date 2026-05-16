'use client';

import { useEffect, useState } from 'react';
import FulfillmentListPage from '@/features/admin/logistics/fulfillment/components/FulfillmentListPage';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';

export default function Page() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadTasks = async () => {
        try {
            const data = await fetchAPI('/operations/logistics/fulfillment');
            setTasks(data.data);
        } catch (error) {
            toast.error('Failed to load fulfillment tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    return <FulfillmentListPage tasks={tasks} loading={loading} />;
}
