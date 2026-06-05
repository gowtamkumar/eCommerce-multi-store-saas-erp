'use client';

import type { DataTableColumn } from '@/components/shared/DataTable';
import { DiscountType } from '@/lib/enums/discount-type.enum';
import { Calendar, CheckCircle2, Edit, Percent, Ticket, Trash2, XCircle } from 'lucide-react';
import type { Coupon } from '../types';

export interface BuildCouponColumnsOptions {
    onEdit: (coupon: Coupon) => void;
    onDelete: (id: string) => void;
    formatPrice: (value: number) => string;
}

export function buildCouponColumns({
    onEdit,
    onDelete,
    formatPrice,
}: BuildCouponColumnsOptions): DataTableColumn<Coupon>[] {
    return [
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
            cell: (coupon) => {
                const isPercentage = coupon.discountType === DiscountType.PERCENTAGE;
                return (
                    <div className="flex items-center gap-1.5">
                        {isPercentage && <Percent className="w-3 h-3 text-slate-400" />}
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {isPercentage ? `${coupon.amount}%` : formatPrice(coupon.amount)}
                        </span>
                    </div>
                );
            },
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
                        {coupon.usedCount || 0} / {coupon.usageLimit || 'Unlimited'} REDEEMED
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
    ];
}
