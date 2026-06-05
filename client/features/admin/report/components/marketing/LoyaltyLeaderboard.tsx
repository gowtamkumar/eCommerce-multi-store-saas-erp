'use client';

import { useMemo } from 'react';
import { Users } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import type { MarketingCustomer } from '../../types';
import { buildLoyaltyColumns } from './marketingColumns';

export interface LoyaltyLeaderboardProps {
    customers: MarketingCustomer[];
    loading: boolean;
}

export default function LoyaltyLeaderboard({ customers, loading }: LoyaltyLeaderboardProps) {
    const columns = useMemo(() => buildLoyaltyColumns(), []);

    return (
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-blue-500" />
                Top Customer Loyalty Rankings
            </h3>
            <DataTable
                data={customers}
                columns={columns}
                getRowKey={(cust) => cust.id || cust.customerEmail || cust.email || cust.customerName || cust.name || ''}
                loading={loading}
                emptyLabel="No customer point balance records found"
                minWidthClassName="min-w-[600px]"
                containerClassName="!bg-transparent !shadow-none !border-none !rounded-none !p-0"
            />
        </div>
    );
}
