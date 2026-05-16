'use client';

import {
    CheckCircle2,
    ChevronLeft, ChevronRight,
    Eye,
    Package,
    Search,
    Truck,
    Clock,
    User,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

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

const FulfillmentRow = memo(({ task }: { task: any }) => {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                {new Date(task.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <Package className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-slate-900 dark:text-white font-bold block tracking-tight uppercase text-xs">
                            Order: {task.order?.id.slice(0, 8)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">
                            {task.order?.customerName}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {task.assignedToUser?.name || 'Unassigned'}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                    {task.items?.length || 0}
                </span>
            </td>
            <td className="px-6 py-4">
                {getStatusBadge(task.status)}
            </td>
            <td className="px-6 py-4 text-right">
                <Link
                    href={`/admin/fulfillment/${task.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/20 dark:shadow-none border border-transparent hover:border-slate-800 dark:hover:border-slate-200"
                >
                    Process Task
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </td>
        </tr>
    );
});

FulfillmentRow.displayName = 'FulfillmentRow';

export default function FulfillmentListPage({ tasks = [], loading = false }: any) {
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

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assignment</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operator</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">SKUs</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-12 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                                            <Package className="w-8 h-8 text-slate-300" strokeWidth={1} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No fulfillment tasks found</p>
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task: any) => (
                                    <FulfillmentRow key={task.id} task={task} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
