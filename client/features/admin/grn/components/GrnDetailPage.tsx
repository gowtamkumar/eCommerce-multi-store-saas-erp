'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { GrnStatus } from '@/lib/enums/grn-status.enum';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    FileText,
    MoreVertical,
    Package,
    ShieldCheck,
    Truck,
    Warehouse,
    XCircle,
    Building2,
    User
} from 'lucide-react';
import Link from 'next/link';
import { getGrnStatusBadge } from './GrnListPage';

export default function GrnDetailPage({ grn, onVerify, onReject, isProcessing }: any) {
    const { formatPrice } = useSettings();

    if (!grn) return null;

    const totalCost = grn.items?.reduce((sum: number, item: any) => sum + (Number(item.receivedQty) * Number(item.unitCost)), 0) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/grn"
                        className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{grn.grnNumber}</h1>
                            {getGrnStatusBadge(grn.status)}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-2">
                            Generated from <Link href={`/admin/purchases/${grn.poId}`} className="text-brand-600 hover:underline">PO: {grn.purchaseOrder?.referenceNumber}</Link>
                        </p>
                    </div>
                </div>

                {grn.status === GrnStatus.DRAFT && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onReject}
                            disabled={isProcessing}
                            className="px-6 py-3 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject
                        </button>
                        <button
                            onClick={onVerify}
                            disabled={isProcessing}
                            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-500/25 flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Verify & Post Stock
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Line Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Received Items
                            </h3>
                            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md text-slate-500">
                                {grn.items?.length || 0} ITEMS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Ordered</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center text-brand-600">Received</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Unit Cost</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {grn.items?.map((item: any, idx: number) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                        <Package className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-900 dark:text-white font-bold block text-sm">{item.product?.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium uppercase">{item.variant?.name || 'Standard'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-slate-500">
                                                {item.orderedQty}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg font-black text-sm">
                                                    {item.receivedQty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-600 dark:text-slate-400">
                                                {formatPrice(item.unitCost)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-black text-slate-900 dark:text-white">
                                                {formatPrice(item.receivedQty * item.unitCost)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Internal Notes
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                            {grn.notes || 'No specific notes provided for this shipment.'}
                        </p>
                    </div>
                </div>

                {/* Right Column: Metadata & Summary */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Receiving Context</h4>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Supplier</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{grn.supplier?.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                    <Warehouse className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Destination</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{grn.warehouse?.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                    <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Branch Scope</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{grn.branch?.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                    <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Received By</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{grn.receivedByUser?.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <Clock className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Receipt Date</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{new Date(grn.receivedDate).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-600 rounded-3xl p-6 shadow-xl shadow-brand-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-200 mb-1">Financial Valuation</h4>
                            <p className="text-4xl font-black text-white tracking-tighter mb-4">
                                {formatPrice(totalCost)}
                            </p>
                            <div className="pt-4 border-t border-brand-500 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-brand-100 uppercase tracking-widest">Post to AP Ledger</span>
                                <span className="text-white font-black text-xs">AUTO</span>
                            </div>
                        </div>
                    </div>

                    {grn.status === GrnStatus.VERIFIED && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/20">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <span className="font-black text-emerald-900 dark:text-emerald-400 text-xs uppercase tracking-widest">Audit Verified</span>
                            </div>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                                This GRN has been verified. Stock has been incremented in the inventory ledger and the supplier AP balance has been updated.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
