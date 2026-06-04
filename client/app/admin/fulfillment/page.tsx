'use client';

import React from 'react';
import FulfillmentListPage from '@/features/admin/logistics/fulfillment/components/FulfillmentListPage';
import { useFulfillmentList } from '@/features/admin/logistics/fulfillment/hooks/useFulfillmentList';

export default function Page() {
    const { tasks, loading } = useFulfillmentList();

    return <FulfillmentListPage tasks={tasks} loading={loading} />;
}
