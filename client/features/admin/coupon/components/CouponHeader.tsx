'use client';

import { Plus, Tag } from 'lucide-react';
import type { CouponHeaderProps } from '../types';

export default function CouponHeader({ onAdd }: CouponHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Promotional Coupons</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-500" />
                    Manage discount rules &amp; marketing campaigns
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
    );
}
