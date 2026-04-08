'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Tag, Ticket, Trash2, Edit2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { memo } from 'react';
import type { CouponListProps } from '../types';
import { DiscountType } from '@/lib/enums/discount-type.enum';

// Memoized row component — prevents full table re-render on search/filter changes
const CouponRow = memo(({ coupon, onEdit, onDelete, currency }: {
    coupon: any,
    onEdit: (c: any) => void,
    onDelete: (id: string) => void,
    currency: string,
}) => {
    const usagePercent = coupon.usageLimit
        ? Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)
        : 0;
    const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();

    return (
        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group animate-in fade-in duration-200">
            <td className="px-6 py-5 cursor-pointer" onClick={() => onEdit(coupon)}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-sm font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 tracking-widest">
                    {coupon.code}
                </div>
                {coupon.description && (
                    <p className="text-[10px] text-slate-400 mt-1.5 max-w-[200px] truncate uppercase tracking-tight">{coupon.description}</p>
                )}
            </td>
            <td className="px-6 py-5 cursor-pointer" onClick={() => onEdit(coupon)}>
                <p className="font-black text-slate-900 dark:text-white text-sm">
                    {coupon.discountType === DiscountType.PERCENTAGE
                        ? `${coupon.amount}% off`
                        : coupon.discountType === DiscountType.FREE_SHIPPING
                            ? 'Free Shipping'
                            : `${formatCurrency(coupon.amount, currency)} off`}
                </p>
                {coupon.minPurchaseAmount > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                        Min. {formatCurrency(coupon.minPurchaseAmount, currency)}
                    </span>
                )}
            </td>
            <td className="px-6 py-5 cursor-pointer" onClick={() => onEdit(coupon)}>
                <div className="space-y-1.5">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300 font-mono">
                        {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' used'}
                    </p>
                    {coupon.usageLimit && (
                        <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : 'bg-brand-500'}`}
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-5 cursor-pointer" onClick={() => onEdit(coupon)}>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    coupon.isActive && !isExpired
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                    {!coupon.isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                </span>
            </td>
            <td className="px-6 py-5 text-sm cursor-pointer" onClick={() => onEdit(coupon)}>
                <span className={`font-mono font-bold ${isExpired ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : '∞ Never'}
                </span>
            </td>
            <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(coupon)}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(coupon.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
});
CouponRow.displayName = 'CouponRow';

export default function CouponList({
    coupons,
    loading,
    onEdit,
    onDelete,
    onAdd,
    searchTerm,
    onSearchChange,
    pagination,
    onPageChange,
    statusFilter,
    onStatusChange,
}: CouponListProps) {
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-brand-500" />
                        </span>
                        Promotions
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 ml-1">Coupon codes & discount instruments</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Issue Coupon
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by coupon code..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="relative w-full sm:w-44">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange?.(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Instrument</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Benefit</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Utilisation</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lifecycle</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Validity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="px-6 py-6">
                                        <div className="h-10 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-2xl" />
                                    </td></tr>
                                ))
                            ) : coupons.length === 0 ? (
                                <tr><td colSpan={6} className="py-24 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Tag className="w-8 h-8 text-slate-300" strokeWidth={1} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No promotion instruments found</p>
                                </td></tr>
                            ) : (
                                coupons.map(coupon => (
                                    <CouponRow key={coupon.id} coupon={coupon} onEdit={onEdit} onDelete={onDelete} currency={currency} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination && pagination.totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Page <span className="text-slate-900 dark:text-white px-1">{pagination.page}</span>
                            of <span className="text-slate-900 dark:text-white px-1">{pagination.totalPages}</span>
                            <span className="ml-2 text-slate-400">({pagination.total} total)</span>
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => onPageChange?.(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => onPageChange?.(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
