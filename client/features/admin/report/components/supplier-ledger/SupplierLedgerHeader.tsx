'use client';

import { ChevronRight, Printer, Receipt, Users } from 'lucide-react';
import React from 'react';
import type { SupplierLedgerHeaderProps } from '../../types';


const SupplierLedgerHeader: React.FC<SupplierLedgerHeaderProps> = ({
    suppliers,
    selectedSupplierId,
    onSupplierChange,
    hasLedgerData
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-brand-600" />
                    Supplier Payment Ledger
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Track obligations and payments for your suppliers</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative w-64">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={selectedSupplierId}
                        onChange={(e) => onSupplierChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none"
                    >
                        <option value="">Select a Supplier</option>
                        {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                </div>
                {hasLedgerData && (
                    <button
                        onClick={() => window.print()}
                        className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Print Ledger"
                    >
                        <Printer className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.memo(SupplierLedgerHeader);
