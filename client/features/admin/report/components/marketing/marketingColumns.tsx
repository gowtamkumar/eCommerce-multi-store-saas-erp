'use client';

import type { DataTableColumn } from '@/components/shared/DataTable';
import { getCampaignSuccessRate } from '../../lib/marketing';
import type { MarketingCampaign, MarketingCustomer } from '../../types';
import { CampaignStatusBadge, ChannelIcon } from './campaignPresentation';

export function buildLoyaltyColumns(): DataTableColumn<MarketingCustomer>[] {
    return [
        {
            key: 'customerName',
            header: 'Customer Name',
            cell: (cust) => (
                <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cust.customerName || cust.name}
                </span>
            ),
        },
        {
            key: 'customerEmail',
            header: 'Email',
            cell: (cust) => (
                <span className="text-slate-500">{cust.customerEmail || cust.email}</span>
            ),
        },
        {
            key: 'membershipTier',
            header: 'Membership Tier',
            cell: (cust) => (
                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold uppercase text-[9px] tracking-wider rounded">
                    {cust.membershipTier || 'BRONZE'}
                </span>
            ),
        },
        {
            key: 'pointsBalance',
            header: 'Points Balance',
            cell: (cust) => (
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {cust.loyaltyPointsBalance || 0} pts
                </span>
            ),
        },
    ];
}

export function buildCampaignColumns(): DataTableColumn<MarketingCampaign>[] {
    return [
        {
            key: 'name',
            header: 'Campaign',
            cell: (c) => (
                <span className="font-bold text-slate-800 dark:text-slate-200 max-w-[150px] truncate block" title={c.name}>
                    {c.name}
                </span>
            ),
        },
        {
            key: 'type',
            header: 'Channel',
            cell: (c) => (
                <span className="capitalize font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <ChannelIcon type={c.type} /> {c.type}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (c) => <CampaignStatusBadge status={c.status} />,
        },
        {
            key: 'reach',
            header: 'Reach',
            cell: (c) => (
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {c.totalAudience || 0}
                </span>
            ),
        },
        {
            key: 'success',
            header: 'Success',
            cell: (c) => (
                <span className="font-mono text-emerald-600 font-semibold">
                    {c.sentCount || 0}
                </span>
            ),
        },
        {
            key: 'failures',
            header: 'Failures',
            cell: (c) => (
                <span className="font-mono text-rose-500 font-semibold">
                    {c.failedCount || 0}
                </span>
            ),
        },
        {
            key: 'rate',
            header: 'Rate',
            cell: (c) => (
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {getCampaignSuccessRate(c).toFixed(1)}%
                </span>
            ),
        },
    ];
}
