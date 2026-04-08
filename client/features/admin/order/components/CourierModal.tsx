'use client';

import { Loader2 } from 'lucide-react';
import { CourierType } from '@/lib/enums/courier-type.enum';
import type { CourierModalProps } from '../type';

export default function CourierModal({
    isOpen,
    onClose,
    onConfirm,
    pendingOrder,
    isCreating
}: CourierModalProps) {
    if (!isOpen || !pendingOrder) return null;

    const { courier, order } = pendingOrder;

    const getCourierName = (type: string) => {
        if (type === CourierType.PATHAO) return 'Pathao';
        if (type === CourierType.STEADFAST) return 'Steadfast';
        if (type === CourierType.IN_STORE) return 'Manual Dispatch';
        return type;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 max-w-md w-full transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4 text-brand-600">
                         🚚
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Create {getCourierName(courier)} Order?
                    </h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Are you sure you want to initialize a courier shipment for order 
                        <span className="mx-1 font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                            #{order.id.slice(-8).toUpperCase()}
                        </span>?
                    </p>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        disabled={isCreating}
                        className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isCreating}
                        className="flex-1 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <span>Confirm Order</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
