'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { GrnStatus } from '@/lib/enums/grn-status.enum';
import {
    CheckCircle2,
    Eye,
    FileText,
    Filter,
    Search,
    Warehouse,
    AlertCircle,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import Pagination from '@/components/shared/Pagination';
import { GrnData, GrnItem } from '@/features/admin/grn/types';


export const getGrnStatusBadge = (status: GrnStatus) => {
    switch (status) {
        case GrnStatus.RECEIVED:
            return (
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                </span>
            );
        case GrnStatus.REJECTED:
            return (
                <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit">
                    <XCircle className="w-3 h-3" />
                    Rejected
                </span>
            );
        default:
            return (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit">
                    <AlertCircle className="w-3 h-3" />
                    Draft
                </span>
            );
    }
};

const GrnRow = memo(({ grn, formatPrice }: {
    grn: GrnData,
    formatPrice: (p: number) => string
}) => {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                {grn.createdAt ? new Date(grn.createdAt).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-slate-900 dark:text-white font-bold block tracking-tight">{grn.grnNumber}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">PO: {grn.purchaseOrder?.referenceNumber || 'N/A'}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{grn.supplier?.name}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{grn.warehouse?.name || 'Main Warehouse'}</span>
                </div>
            </td>
            <td className="px-6 py-4 font-black text-slate-900 dark:text-white font-mono text-sm">
                {formatPrice(grn.items?.reduce((sum: number, item: GrnItem) => sum + (Number(item.receivedQty) * Number(item.unitCost)), 0) || 0)}
            </td>
            <td className="px-6 py-4">
                {getGrnStatusBadge(grn.status)}
            </td>
            <td className="px-6 py-4 text-right">
                <Link
                    href={`/admin/procurement/grn/${grn.id}`}
                    className="inline-flex p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
                    title="View Details"
                >
                    <Eye className="w-5 h-5" />
                </Link>
            </td>
        </tr>
    );
});

GrnRow.displayName = 'GrnRow';

interface GrnListPageProps {
    grns?: GrnData[];
    loading?: boolean;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    statusFilter?: string;
    onStatusFilterChange?: (value: string) => void;
    pagination?: {
        page: number;
        totalPages: number;
        total: number;
    };
    onPageChange?: (page: number) => void;
}

export default function GrnListPage({
    grns = [],
    loading = false,
    searchQuery = '',
    onSearchChange = () => {},
    statusFilter = '',
    onStatusFilterChange = () => {},
    pagination = { page: 1, totalPages: 1, total: 0 },
    onPageChange = () => {}
}: GrnListPageProps) {
    const { formatPrice } = useSettings();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Goods Received Notes</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-500" />
                        Formal receipt and verification of incoming inventory
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search GRN # or supplier..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
                    />
                </div>
                <div className="relative w-full md:w-56">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                        <option value="">All Statuses</option>
                        <option value={GrnStatus.DRAFT}>Draft</option>
                        <option value={GrnStatus.RECEIVED}>Received</option>
                        <option value={GrnStatus.REJECTED}>Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Destination</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Valuation</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-6 py-8">
                                            <div className="h-12 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : grns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                                            <CheckCircle2 className="w-8 h-8 text-slate-300" strokeWidth={1} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No GRNs found</p>
                                    </td>
                                </tr>
                            ) : (
                                grns.map((grn: GrnData) => (
                                    <GrnRow
                                        key={grn.id}
                                        grn={grn}
                                        formatPrice={formatPrice}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Page <span className="text-slate-900 dark:text-white px-1">{pagination.page}</span> of <span className="text-slate-900 dark:text-white px-1">{pagination.totalPages}</span>
                        </p>
                        <Pagination
                            currentPage={Number(pagination.page) || 1}
                            totalPages={Number(pagination.totalPages) || 1}
                            onPageChange={(p) => onPageChange(p)}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
