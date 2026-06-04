'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import type { Order } from '@/types/order';

interface CourierStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    loadingStatus: boolean;
    liveStatus: any;
}

export default function CourierStatusModal({
    isOpen,
    onClose,
    order,
    loadingStatus,
    liveStatus,
}: CourierStatusModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 max-w-md w-full transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            Live Courier Status
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">
                            TRACKING: {order.trackingId}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        ✕
                    </button>
                </div>

                {loadingStatus && (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Contacting Courier API...</p>
                    </div>
                )}

                {!loadingStatus && liveStatus && (
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Status</span>
                            <h4 className="text-xl font-black text-brand-600 mt-1 uppercase">
                                {liveStatus.status || liveStatus.order_status || liveStatus.data?.status || 'Unknown'}
                            </h4>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Tracking Timeline</span>
                            
                            {liveStatus.status_log && Array.isArray(liveStatus.status_log) && liveStatus.status_log.length > 0 ? (
                                <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-700 space-y-4">
                                    {liveStatus.status_log.map((log: any, idx: number) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-slate-800" />
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{log.status}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{log.date || log.time}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-xs text-slate-500">
                                    No detailed status history logs found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
