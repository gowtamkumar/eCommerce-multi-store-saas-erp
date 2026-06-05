'use client';

import { Percent } from 'lucide-react';
import type { MarketingDiscountTotals } from '../../types';

export interface DiscountAnalysisPanelProps {
    discounts: MarketingDiscountTotals;
    formatPrice: (price: number) => string;
}

interface DiscountTile {
    label: string;
    amount: number;
    note: string;
    valueClass: string;
}

export default function DiscountAnalysisPanel({ discounts, formatPrice }: DiscountAnalysisPanelProps) {
    const tiles: DiscountTile[] = [
        {
            label: 'Total Discount Savings Given',
            amount: discounts.totalSaved,
            note: 'Total deductions applied to checkout subtotals',
            valueClass: 'text-brand-500',
        },
        {
            label: 'Coupon Discounts Given',
            amount: discounts.couponDiscountTotal,
            note: 'Saved using unique coupon code redemptions',
            valueClass: 'text-blue-400',
        },
        {
            label: 'Promotion / Offer Discounts Given',
            amount: discounts.promoDiscountTotal,
            note: 'Savings applied via line item campaign discounts',
            valueClass: 'text-purple-400',
        },
    ];

    return (
        <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-4xl text-white">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <Percent className="w-6 h-6 text-brand-500" />
                <div>
                    <h2 className="text-lg font-black uppercase tracking-wider font-display">Discount Sales Analysis</h2>
                    <p className="text-xs text-slate-400">Total overall money saved by customers via coupons and promotion campaigns</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiles.map((tile) => (
                    <div key={tile.label} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">{tile.label}</span>
                        <p className={`text-3xl font-black ${tile.valueClass}`}>{formatPrice(tile.amount)}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-semibold">{tile.note}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
