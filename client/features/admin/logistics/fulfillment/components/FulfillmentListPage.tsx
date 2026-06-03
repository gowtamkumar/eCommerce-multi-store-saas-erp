'use client';

import {
    Package,
    Truck,
    Clock,
    User,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import Link from 'next/link';
import { useMemo } from 'react';

type FulfillmentTask = {
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
};

type FulfillmentListPageProps = {
    tasks?: FulfillmentTask[];
    loading?: boolean;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'SHIPPED':
            return (
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit">
                    <Truck className="w-3 h-3" />
                    Shipped
                </span>
            );
        case 'PACKED':
            return (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit">
                    <Package className="w-3 h-3" />
                    Packed
                </span>
            );
        case 'PICKING':
            return (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3" />
                    Picking
                </span>
            );
        default:
            return (
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit">
                    <AlertCircle className="w-3 h-3" />
                    Pending
                </span>
            );
    }
};

export default function FulfillmentListPage({ tasks = [], loading = false }: FulfillmentListPageProps) {
    const columns = useMemo<DataTableColumn<FulfillmentTask>[]>(() => [
        {
            key: 'date',
            header: 'Date',
            className: 'text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono',
            cell: (task) => new Date(task.createdAt).toLocaleDateString(),
        },
        {
            key: 'assignment',
            header: 'Assignment',
            cell: (task) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <Package className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-slate-900 dark:text-white font-bold block tracking-tight uppercase text-xs">
                            Order: {task.order?.id.slice(0, 8) || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">
                            {task.order?.customerName || 'Unknown customer'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'operator',
            header: 'Operator',
            cell: (task) => (
                <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {task.assignedToUser?.name || 'Unassigned'}
                    </span>
                </div>
            ),
        },
        {
            key: 'skus',
            header: 'SKUs',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (task) => (
                <span className="text-sm font-black text-slate-900 dark:text-white">
                    {task.items?.length || 0}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (task) => getStatusBadge(task.status),
        },
        {
            key: 'control',
            header: 'Control',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (task) => (
                <Link
                    href={`/admin/fulfillment/${task.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/20 dark:shadow-none border border-transparent hover:border-slate-800 dark:hover:border-slate-200"
                >
                    Process Task
                    <ArrowRight className="w-3 h-3" />
                </Link>
            ),
        },
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fulfillment Center</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-2">
                        <Truck className="w-4 h-4 text-brand-500" />
                        Manage picking, packing and dispatching orders
                    </p>
                </div>
            </div>

            <DataTable
                data={tasks}
                columns={columns}
                getRowKey={(task) => task.id}
                loading={loading}
                loadingLabel="Loading fulfillment tasks..."
                emptyLabel={
                    <div>
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                            <Package className="w-8 h-8 text-slate-300" strokeWidth={1} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No fulfillment tasks found</p>
                    </div>
                }
                containerClassName="rounded-[2.5rem]"
            />
        </div>
    );
}
