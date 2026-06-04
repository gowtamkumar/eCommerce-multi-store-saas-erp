'use client';

import { ShieldAlert } from 'lucide-react';

export default function FiscalPeriodAuditBanner() {
    return (
        <div className="lg:col-span-1 bg-amber-50/20 border border-amber-200 p-8 rounded-4xl h-fit space-y-4">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Fiscal Period Locks</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Closing a fiscal period prevents any cashier shifts, sales, inventory adjustments, purchase invoices, or journal vouchers from being backdated or posted to closed dates.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
                Ensure all reconciliations, inventory cycle counts, and payroll calculations are fully completed before locking a period.
            </p>
        </div>
    );
}
