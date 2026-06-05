'use client';

import type { DataTableColumn } from '@/components/shared/DataTable';
import { LeadStatus } from '@/lib/enums/lead-status.enum';
import { Loader2 } from 'lucide-react';
import type { LeadMessage } from '../type';

interface BuildLeadColumnsOptions {
    updatingStatus: string | null;
    onStatusUpdate: (id: string, newStatus: LeadStatus) => void;
}

function getStatusColor(status: LeadStatus) {
    switch (status) {
        case LeadStatus.NEW:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case LeadStatus.CONTACTED:
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        case LeadStatus.CONVERTED:
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
}

export function buildLeadColumns({
    updatingStatus,
    onStatusUpdate,
}: BuildLeadColumnsOptions): DataTableColumn<LeadMessage>[] {
    return [
        {
            key: 'createdAt',
            header: 'Date',
            className: 'text-slate-500 dark:text-slate-400 whitespace-nowrap',
            cell: (lead) => new Date(lead.createdAt).toLocaleDateString(),
        },
        {
            key: 'name',
            header: 'Name',
            cell: (lead) => (
                <div>
                    <div className="font-medium text-slate-900 dark:text-white">{lead.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{lead.email}</div>
                </div>
            ),
        },
        {
            key: 'phone',
            header: 'Phone',
            className: 'text-slate-900 dark:text-white',
            cell: (lead) => lead.phone || '-',
        },
        {
            key: 'subject',
            header: 'Subject',
            className: 'text-slate-900 dark:text-white',
            cell: (lead) => lead.subject || '-',
        },
        {
            key: 'message',
            header: 'Message',
            className: 'text-slate-600 dark:text-slate-300 max-w-xs truncate',
            cell: (lead) => (
                <span title={lead.message}>
                    {lead.message || '-'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (lead) => (
                <div className="flex items-center gap-2">
                    <select
                        value={lead.status}
                        onChange={(event) => onStatusUpdate(lead.id, event.target.value as LeadStatus)}
                        disabled={updatingStatus === lead.id}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border-none cursor-pointer focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none ${getStatusColor(lead.status)}`}
                    >
                        {Object.values(LeadStatus).map((status) => (
                            <option key={status} value={status} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                {status.toUpperCase()}
                            </option>
                        ))}
                    </select>
                    {updatingStatus === lead.id && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                </div>
            ),
        },
    ];
}
