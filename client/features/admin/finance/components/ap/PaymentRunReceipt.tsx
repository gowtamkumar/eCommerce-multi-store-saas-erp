'use client';

import { CheckCircle2 } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import type { BatchPaymentResult } from '../../types';

export interface PaymentRunReceiptProps {
    result: BatchPaymentResult;
}

export default function PaymentRunReceipt({ result }: PaymentRunReceiptProps) {
    const { formatPrice } = useSettings();

    return (
        <div className="bg-emerald-50 border border-emerald-100 dark:border-emerald-950/20 dark:bg-emerald-950/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">Run Execution Receipt</span>
            </div>
            <div className="text-xs space-y-1 font-semibold text-emerald-700 dark:text-emerald-300">
                <p>Processed: <span className="font-bold">{result.processedCount} invoices paid in full</span></p>
                {result.failedCount > 0 && (
                    <p className="text-rose-600 dark:text-rose-400">Failed: {result.failedCount} invoice executions rejected</p>
                )}
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2 border-t border-emerald-100 dark:border-emerald-950/20">
                {result.payments?.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-mono text-emerald-800 dark:text-emerald-400">
                        <span>Invoice #{p.invoiceNumber}</span>
                        <span>+{formatPrice(p.amountPaid)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
