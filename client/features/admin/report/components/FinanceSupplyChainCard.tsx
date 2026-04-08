'use client';

import { Truck } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { SupplierStats } from '../types';

interface FinanceSupplyChainCardProps {
    stats?: SupplierStats;
    payoutsDue: number;
    isLoading: boolean;
    formatPrice: (price: number) => string;
}

export default function FinanceSupplyChainCard({ stats, payoutsDue, isLoading, formatPrice }: FinanceSupplyChainCardProps) {
    if (isLoading && !stats) {
        return (
            <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl animate-pulse h-[320px]" />
        );
    }

    return (
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                <Truck className="w-24 h-24" />
            </div>
            <div>
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-white">
                    Supply Chain
                </h3>
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Payouts Due</p>
                        <p className="text-3xl font-black text-rose-400 font-mono">
                            {formatPrice(payoutsDue)}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Suppliers</p>
                            <p className="text-xl font-black">{stats?.totalSuppliers || 0}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total POs</p>
                            <p className="text-xl font-black">{stats?.totalPurchaseOrders || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Link
                href="/admin/reports/supplier-ledger"
                className="mt-8 block w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
            >
                Open Supplier Ledger
            </Link>
        </div>
    );
}
