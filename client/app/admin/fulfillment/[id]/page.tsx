'use client';

import React, { use } from 'react';
import FulfillmentDetailPage from '@/features/admin/logistics/fulfillment/components/FulfillmentDetailPage';
import { useFulfillmentDetail } from '@/features/admin/logistics/fulfillment/hooks/useFulfillmentDetail';

export default function Page({ params: paramsPromise }: any) {
    const params = use(paramsPromise) as any;
    const {
        task,
        loading,
        isProcessing,
        handleStart,
        handlePick,
        handlePack,
        handleShip,
    } = useFulfillmentDetail(params.id);

    if (loading) {
        return (
            <div className="p-8 text-center animate-pulse font-black text-[10px] uppercase tracking-widest text-slate-400">
                Loading fulfillment task...
            </div>
        );
    }

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
