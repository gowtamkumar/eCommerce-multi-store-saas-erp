'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { 
    Tag, Search, Plus, Edit, Trash2, 
    Filter, Calendar, Percent, Ticket, CheckCircle2, XCircle
} from 'lucide-react';
import { useMemo } from 'react';
import type { CouponListProps, Coupon } from '../types';

export default function CouponList({
    coupons,
    loading,
    onEdit,
    onDelete,
    onAdd,
    searchQuery,
    onSearchChange,
    pagination,
    onPageChange,
    statusFilter,
    onStatusFilterChange,
    isSearchLoading
}: CouponListProps) {
    const columns = useMemo<DataTableColumn<Coupon>[]>(() => [
        {
            key: 'coupon',
            header: 'Coupon',
            cell: (coupon) => (
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
                        <Ticket className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <span className="text-sm font-black text-slate-900 dark:text-white block tracking-tight uppercase">
                            {coupon.code}
                        </span>
                        {coupon.description && (
                            <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[150px]">
                                {coupon.description}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'benefit',
            header: 'Benefit',
            cell: (coupon) => (
                <div className="flex items-center gap-1.5">
                    {coupon.discountType === 'PERCENTAGE' ? (
                        <Percent className="w-3 h-3 text-slate-400" />
                    ) : (
                        <span className="text-xs font-bold text-slate-400">$</span>
                    )}
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {coupon.amount}{coupon.discountType === 'PERCENTAGE' ? '%' : ''}
                    </span>
                </div>
            ),
        },
        {
            key: 'redemption',
            header: 'Redemption',
            cell: (coupon) => (
                <div className="flex flex-col gap-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-brand-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(((coupon.usedCount || 0) / (coupon.usageLimit || 1)) * 100, 100)}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                        {coupon.usedCount || 0} / {coupon.usageLimit || '∞'} REDEEMED
                    </span>
                </div>
            ),
        },
        {
            key: 'validity',
            header: 'Validity',
            cell: (coupon) => (
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'NO EXPIRY'}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (coupon) => coupon.isActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-3 h-3" /> Active
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900/20 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                    <XCircle className="w-3 h-3" /> Inactive
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (coupon) => (
                <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all">
                    <button
                        onClick={() => onEdit(coupon)}
                        className="p-2 text-slate-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(coupon.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ], [onDelete, onEdit]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Promotional Coupons</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-2">
                        <Tag className="w-4 h-4 text-brand-500" />
                        Manage discount rules & marketing campaigns
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-500/25 flex items-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Create Coupon
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearchLoading ? 'text-brand-500 animate-spin' : 'text-slate-400 group-focus-within:text-brand-500'}`} />
                    <input
                        type="text"
                        placeholder="Search coupon code..."
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
                        <option value="true">Active Only</option>
                        <option value="false">Inactive Only</option>
                    </select>
                </div>
            </div>

            <DataTable
                data={coupons}
                columns={columns}
                getRowKey={(coupon) => coupon.id}
                loading={loading && !coupons.length}
                loadingLabel="Loading coupons..."
                emptyLabel={
                    <div>
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                            <Tag className="w-8 h-8 text-slate-300" strokeWidth={1} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No matching coupons found</p>
                    </div>
                }
                containerClassName="rounded-3xl min-h-[400px]"
                pagination={{
                    page: pagination.page,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange,
                }}
                paginationSummary={
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Index <span className="text-slate-900 dark:text-white px-1">{pagination.page}</span> of <span className="text-slate-900 dark:text-white px-1">{pagination.totalPages}</span>
                        <span className="ml-2 text-slate-400 font-bold">({pagination.total} ENTITIES)</span>
                    </p>
                }
            />
        </div>
    );
}
