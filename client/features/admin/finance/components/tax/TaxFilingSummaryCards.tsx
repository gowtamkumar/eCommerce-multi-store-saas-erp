'use client';

import { ArrowDownCircle, ArrowUpCircle, Coins } from 'lucide-react';
import type { TaxFilingData } from '../../types';

type PriceFormatter = (amount: number) => string;

export interface TaxFilingSummaryCardsProps {
    filing: TaxFilingData | null;
    formatPrice: PriceFormatter;
}

export default function TaxFilingSummaryCards({ filing, formatPrice }: TaxFilingSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl">
                        <ArrowUpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Output VAT</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Collected from Customers</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatPrice(filing?.outputTaxCollected || 0)}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">From {formatPrice(filing?.taxableSales || 0)} taxable sales</p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl">
                        <ArrowDownCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input VAT Credit</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Paid to Suppliers (Deductible)</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatPrice(filing?.inputTaxCredit || 0)}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">From {formatPrice(filing?.taxablePurchases || 0)} purchases</p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl">
                        <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Tax Due</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Regional Liability</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatPrice(filing?.netTaxLiability || 0)}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">Output VAT - Input VAT Credit</p>
            </div>
        </div>
    );
}
