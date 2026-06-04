'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';

export function useFulfillmentDetail(id: string) {
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadTask = useCallback(async () => {
        try {
            const data = await fetchAPI(`/operations/logistics/fulfillment/${id}`);
            if (data?.success) {
                setTask(data.data);
            } else if (data) {
                setTask(data);
            }
        } catch (error) {
            console.error('Failed to load task details', error);
            toast.error('Failed to load fulfillment task');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            void loadTask();
        }
    }, [id, loadTask]);

    const handleStart = useCallback(async () => {
        setIsProcessing(true);
        try {
            await fetchAPI(`/operations/logistics/fulfillment/${id}/start`, {
                method: 'POST'
            });
            toast.success('Picking started');
            void loadTask();
        } catch (error) {
            console.error('Failed to start picking', error);
            toast.error('Failed to start picking');
        } finally {
            setIsProcessing(false);
        }
    }, [id, loadTask]);

    const handlePick = useCallback(async (itemId: string, quantity: number) => {
        setIsProcessing(true);
        try {
            await fetchAPI(`/operations/logistics/fulfillment/${id}/pick`, {
                method: 'POST',
                body: JSON.stringify({
                    items: [{ itemId, quantity }]
                })
            });
            toast.success('Item picked');
            void loadTask();
        } catch (error) {
            console.error('Failed to pick item', error);
            toast.error('Failed to pick item');
        } finally {
            setIsProcessing(false);
        }
    }, [id, loadTask]);

    const handlePack = useCallback(async () => {
        setIsProcessing(true);
        try {
            await fetchAPI(`/operations/logistics/fulfillment/${id}/pack`, {
                method: 'POST'
            });
            toast.success('Packing completed');
            void loadTask();
        } catch (error) {
            console.error('Failed to complete packing', error);
            toast.error('Failed to complete packing');
        } finally {
            setIsProcessing(false);
        }
    }, [id, loadTask]);

    const handleShip = useCallback(async () => {
        setIsProcessing(true);
        try {
            await fetchAPI(`/operations/logistics/fulfillment/${id}/ship`, {
                method: 'POST'
            });
            toast.success('Order shipped and inventory updated');
            void loadTask();
        } catch (error) {
            console.error('Failed to ship order', error);
            toast.error('Failed to ship order');
        } finally {
            setIsProcessing(false);
        }
    }, [id, loadTask]);

    return {
        task,
        loading,
        isProcessing,
        loadTask,
        handleStart,
        handlePick,
        handlePack,
        handleShip,
    };
}
