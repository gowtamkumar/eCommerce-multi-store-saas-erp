'use client';

import { Percent, Search, Tag } from 'lucide-react';
import type { MarketingCoupon } from '../../types';

export interface CouponRedemptionPanelProps {
    coupons: MarketingCoupon[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    formatPrice: (price: number) => string;
}

export default function CouponRedemptionPanel({
    coupons,
    loading,
    search,
    onSearchChange,
    formatPrice,
}: CouponRedemptionPanelProps) {
    return (
        <div className="xl:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Tag className="w-5 h-5 text-purple-500" />
                            Coupon Redemption
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Discount code conversions</p>
                    </div>
                    <div className="relative group w-full sm:w-40">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search code..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
                        ))
                    ) : coupons.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-10 font-semibold">No coupons found</p>
                    ) : (
                        coupons.map((c, i) => (
                            <div key={c.id || i} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">{c.code}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Percent className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] text-slate-400 font-semibold">
                                            {c.discountType === 'percentage' ? `${c.amount}% discount` : `${formatPrice(c.amount)} discount`}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono text-xs font-black text-slate-900 dark:text-white block">{c.usedCount || 0} uses</span>
                                    <span className="text-[9px] font-black uppercase text-slate-400">
                                        Limit: {c.usageLimit || 'Unlimited'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
