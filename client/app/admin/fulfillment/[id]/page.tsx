'use client';

import { useEffect, useState, use } from 'react';
import FulfillmentDetailPage from '@/features/admin/logistics/fulfillment/components/FulfillmentDetailPage';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function Page({ params: paramsPromise }: any) {
    const params = use(paramsPromise) as any;
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadTask = async () => {
        try {
            const data = await fetchAPI(`/operations/logistics/fulfillment/${params.id}`);
            setTask(data.data);
        } catch (error) {
            toast.error('Failed to load fulfillment task');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTask();
    }, [params.id]);

    const handleStart = async () => {
        setIsProcessing(true);
        try {
            await fetchAPI(`/operations/logistics/fulfillment/${params.id}/start`, {
                method: 'POST'
            });
            toast.success('Picking started');
            loadTask();
        } catch (error) {
            toast.error('Failed to start picking');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePick = async (itemId: string, quantity: number) => {
        setIsProcessing(true);
        try {
            await fetchAPI(`/operations/logistics/fulfillment/${params.id}/pick`, {
                method: 'POST',
                body: JSON.stringify({
                    items: [{ itemId, quantity }]
                })
            });
            toast.success('Item picked');
            loadTask();
        } catch (error) {
            toast.error('Failed to pick item');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePack = async () => {
        setIsProcessing(true);
        try {
            await fetchAPI(`/operations/logistics/fulfillment/${params.id}/pack`, {
                method: 'POST'
            });
            toast.success('Packing completed');
            loadTask();
        } catch (error) {
            toast.error('Failed to complete packing');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleShip = async () => {
        setIsProcessing(true);
        try {
            await fetchAPI(`/operations/logistics/fulfillment/${params.id}/ship`, {
                method: 'POST'
            });
            toast.success('Order shipped and inventory updated');
            loadTask();
        } catch (error) {
            toast.error('Failed to ship order');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse font-black text-[10px] uppercase tracking-widest text-slate-400">Loading fulfillment task...</div>;

    return (
        <FulfillmentDetailPage
            task={task}
            onStart={handleStart}
            onPick={handlePick}
            onPack={handlePack}
            onShip={handleShip}
            isProcessing={isProcessing}
        />
    );
}
