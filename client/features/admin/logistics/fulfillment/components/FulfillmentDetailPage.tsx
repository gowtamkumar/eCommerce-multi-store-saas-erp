'use client';

import {
    ArrowLeft,
    CheckCircle2,
    Package,
    Warehouse,
    MapPin,
    Truck,
    Clock,
    User,
    AlertCircle,
    Boxes,
    Scan,
    ArrowRight,
    Circle,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import FulfillmentPackingSlipPanel from './FulfillmentPackingSlipPanel';

export default function FulfillmentDetailPage({ task, onStart, onPick, onPack, onShip, isProcessing }: any) {
    const [pickingQuantities, setPickingQuantities] = useState<Record<string, number>>({});

    if (!task) return null;

    const allItemsPicked = task.items.every((item: any) => item.status === 'PICKED');

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-24">
            {/* Mobile Header */}
            <div className="flex items-center justify-between sticky top-0 z-20 bg-slate-50 dark:bg-slate-900 py-4 -mx-4 px-4 border-b border-slate-200 dark:border-slate-800 lg:static lg:bg-transparent lg:border-0 lg:p-0">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/fulfillment"
                        className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Fulfillment</h1>
                        <span className="text-[10px] font-black text-slate-400 tracking-widest">ORDER #{task.order?.id.slice(0, 8)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {task.status === 'PENDING' && (
                        <button
                            onClick={onStart}
                            disabled={isProcessing}
                            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                        >
                            Start
                        </button>
                    )}
                    {task.status === 'PACKED' && (
                        <button
                            onClick={onShip}
                            disabled={isProcessing}
                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform flex items-center gap-2"
                        >
                            <Truck className="w-4 h-4" />
                            Ship
                        </button>
                    )}
                </div>
            </div>

            {/* Picking Progress Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-brand-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Picking Progress</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md">
                        {task.items.filter((i: any) => i.status === 'PICKED').length} / {task.items.length} SKUs
                    </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${(task.items.filter((i: any) => i.status === 'PICKED').length / task.items.length) * 100}%` }}
                    />
                </div>
            </div>

            <FulfillmentPackingSlipPanel task={task} />

            {/* Picking List */}
            <div className="space-y-4">
                {task.items.map((item: any) => {
                    const isPicked = item.status === 'PICKED';
                    return (
                        <div
                            key={item.id}
                            className={`relative bg-white dark:bg-slate-800 rounded-3xl p-4 border transition-all ${isPicked ? 'border-emerald-500/50 bg-emerald-50/10' : 'border-slate-100 dark:border-slate-700'}`}
                        >
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 relative">
                                    <Package className="w-8 h-8 text-slate-400" strokeWidth={1} />
                                    {isPicked && (
                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                            <CheckCircle className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate uppercase">{item.product?.name}</h4>
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest block uppercase">SKU: {item.variant?.sku || 'N/A'}</span>
                                    
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                            <MapPin className="w-3 h-3 text-amber-600" />
                                            <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase">{item.bin?.name || 'Unassigned Bin'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Boxes className="w-3 h-3" />
                                            <span className="text-xs font-bold">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {task.status === 'PICKING' && !isPicked && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPickingQuantities(p => ({ ...p, [item.id]: Math.max(0, (p[item.id] || 0) - 1) }))}
                                            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl font-bold"
                                        >
                                            -
                                        </button>
                                        <div className="w-12 text-center text-lg font-black text-slate-900 dark:text-white">
                                            {pickingQuantities[item.id] || 0}
                                        </div>
                                        <button
                                            onClick={() => setPickingQuantities(p => ({ ...p, [item.id]: Math.min(item.quantity, (p[item.id] || 0) + 1) }))}
                                            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => onPick(item.id, pickingQuantities[item.id] || 0)}
                                        disabled={isProcessing || (pickingQuantities[item.id] || 0) === 0}
                                        className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md flex items-center gap-2"
                                    >
                                        <Scan className="w-3 h-3" />
                                        Pick Item
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Action Bar Bottom (Mobile) */}
            {task.status === 'PICKING' && allItemsPicked && (
                <div className="fixed bottom-6 left-6 right-6 z-30">
                    <button
                        onClick={onPack}
                        disabled={isProcessing}
                        className="w-full py-5 bg-brand-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/40 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Complete Packing
                    </button>
                </div>
            )}
        </div>
    );
}
