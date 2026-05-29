"use client";

import { useSettings } from "@/hooks/SettingsContext";
import { fetchAPI } from "@/services/api";
import { ReturnStatus } from "@/lib/enums/return-status.enum";
import { RefundMethod, REFUND_METHOD_LABELS } from "@/lib/enums/refund-method.enum";
import {
    ArrowLeft,
    Calendar,
    FileText,
    Loader2,
    Mail,
    Package,
    Phone,
    RefreshCw,
    X,
    Check,
    MessageSquare,
    History,
    AlertCircle,
    ChevronRight,
    ShoppingBag,
    DollarSign,
    ArrowRightLeft,
    PackageCheck,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ReturnRequest } from "@/types/order";

export default function ReturnDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [adminComment, setAdminComment] = useState("");
    const [selectedRefundMethod, setSelectedRefundMethod] = useState<RefundMethod>(RefundMethod.STORE_CREDIT);
    const [markingReceived, setMarkingReceived] = useState(false);
    const { settings, formatPrice } = useSettings();

    useEffect(() => {
        if (id) {
            fetchReturn();
        }
    }, [id]);

    const fetchReturn = async () => {
        try {
            const res = await fetchAPI(`/returns/${id}`);
            const data = res.data;
            if (data && data.id) {
                setReturnRequest(data);
            } else {
                console.error("Return data missing or invalid:", res);
            }
        } catch (error) {
            console.error("Failed to fetch return", error);
            toast.error("Failed to load return details");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status: string, comment?: string, refundMethod?: RefundMethod) => {
        setUpdating(true);
        try {
            const res = await fetchAPI(`/returns/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status, comment: comment || adminComment || undefined, refundMethod }),
            });

            if (res.success || (res.data && res.data.id)) {
                setReturnRequest(res.data || res);
                setAdminComment("");
                toast.success(`Return request ${status} successfully`);
            } else {
                toast.error(res.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Failed to update return status", error);
            toast.error("An error occurred");
        } finally {
            setUpdating(false);
        }
    };

    const handleMarkReceived = async () => {
        setMarkingReceived(true);
        try {
            const res = await fetchAPI(`/returns/${id}/received`, { method: "PATCH" });
            if (res.success || res.data?.id) {
                setReturnRequest(res.data);
                toast.success("Return items marked as received");
            } else {
                toast.error(res.message || "Failed to mark as received");
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setMarkingReceived(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        await fetchReturn();
        toast.success("Data refreshed");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!returnRequest) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Return request not found.
                </p>
                <Link href="/admin/returns" className="text-brand-600 hover:underline">
                    Back to Returns
                </Link>
            </div>
        );
    }

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case ReturnStatus.APPROVED:
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case ReturnStatus.RECEIVED:
                return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400";
            case ReturnStatus.REJECTED:
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case ReturnStatus.REFUNDED:
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case ReturnStatus.EXCHANGED:
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            case ReturnStatus.CANCELLED:
                return "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400";
            default:
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        }
    };

    return (
        <div className="max-w-full mx-auto space-y-8 pb-12">
            {/* Print-only Invoice/Return Slip */}
            <div className="hidden print:block bg-white p-8 text-black">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
                            Return Slip
                        </h1>
                        <p className="text-slate-500 font-mono">
                            #{returnRequest.id?.slice(-8)?.toUpperCase()}
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-brand-600">
                            {settings?.brandName || "Store"}
                        </h2>
                        <p className="text-sm text-slate-500 max-w-[200px] ml-auto">
                            {settings?.address}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12 border-t pt-8">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Info</h3>
                        <p className="text-lg font-bold text-slate-900">{returnRequest.order?.customerName}</p>
                        <p className="text-slate-600">{returnRequest.order?.customerEmail}</p>
                        <p className="text-slate-600">{returnRequest.order?.customerPhone}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Original Order</h3>
                        <p className="text-lg font-bold text-slate-900 uppercase">#{returnRequest.order?.id?.slice(-8)}</p>
                        <p className="text-slate-600">Status: {returnRequest.status.toUpperCase()}</p>
                        <p className="text-slate-600">Date: {new Date(returnRequest.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <table className="w-full mb-12 border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-900 text-left">
                            <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900">Item</th>
                            <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-center">Qty</th>
                            <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-right">Refund Est.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returnRequest.items.map((returnItem: any, index: number) => {
                            const orderItem = returnRequest.order?.items?.find(
                                (oi: any) => oi.productId === returnItem.productId &&
                                    (oi.variantId === returnItem.variantId || (!oi.variantId && !returnItem.variantId))
                            );
                            const unitPrice = orderItem ? (Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0)) : 0;
                            return (
                                <tr key={index} className="border-b border-slate-100">
                                    <td className="py-6">
                                        <p className="font-bold text-slate-900">{orderItem?.product?.name || "Product"}</p>
                                        {orderItem?.variant?.sku && <p className="text-xs text-slate-500 uppercase">SKU: {orderItem.variant.sku}</p>}
                                    </td>
                                    <td className="py-6 text-center font-bold">{returnItem.quantity}</td>
                                    <td className="py-6 text-right font-bold text-slate-900">{formatPrice(unitPrice * returnItem.quantity)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="flex justify-end pt-8 border-t-2 border-slate-900">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-400 uppercase mb-1">Total Refund Estimate</p>
                        <p className="text-4xl font-bold text-green-600">
                            {formatPrice(returnRequest.items.reduce((total: number, item: any) => {
                                const orderItem = returnRequest.order?.items?.find((oi: any) => oi.productId === item.productId && (oi.variantId === item.variantId || (!oi.variantId && !item.variantId)));
                                return total + (orderItem ? (Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0)) * item.quantity : 0);
                            }, 0))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-4 print:hidden">
                <div className="flex items-start justify-between w-full">
                    <div>
                        <Link
                            href="/admin/returns"
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors mb-3 uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Returns
                        </Link>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            Return
                            <span className="text-slate-300 dark:text-slate-600 font-mono text-2xl uppercase">
                                #{returnRequest.id.slice(-8)}
                            </span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                <Calendar className="w-4 h-4 text-brand-500" />
                                <span>{new Date(returnRequest.createdAt).toLocaleString()}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusStyles(returnRequest.status || 'PENDING')}`}>
                                {returnRequest.status}
                            </span>
                            {(returnRequest as any).returnType && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
                                    <ArrowRightLeft className="w-3 h-3" />
                                    {(returnRequest as any).returnType}
                                </span>
                            )}
                            {(returnRequest as any).refundAmount != null && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    Refund: {formatPrice(Number((returnRequest as any).refundAmount))}
                                </span>
                            )}
                            {(returnRequest as any).refundMethod && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {REFUND_METHOD_LABELS[(returnRequest as any).refundMethod as RefundMethod] ?? (returnRequest as any).refundMethod}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleRefresh}
                            className="p-2 sm:px-4 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline font-bold text-sm">Refresh</span>
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="p-2 sm:px-4 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline font-bold text-sm">Print Slip</span>
                        </button>
                    </div>
                </div>

                {/* Admin Comment Input */}
                {(returnRequest.status === ReturnStatus.PENDING || returnRequest.status === ReturnStatus.APPROVED || returnRequest.status === ReturnStatus.RECEIVED) && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Notes (optional):</p>
                        <textarea
                            rows={2}
                            placeholder="Add a note for this action (e.g. reason for rejection, notes for refund)..."
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                        />
                    </div>
                )}

                {/* Refund Method Selector (for APPROVED → REFUNDED transition) */}
                {returnRequest.status === ReturnStatus.APPROVED && (
                    <div className="pt-1 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refund Method:</p>
                        <select
                            value={selectedRefundMethod}
                            onChange={(e) => setSelectedRefundMethod(e.target.value as RefundMethod)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                        >
                            {Object.values(RefundMethod).map((m) => (
                                <option key={m} value={m}>{REFUND_METHOD_LABELS[m]}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Quick Actions:</p>

                    {/* PENDING actions */}
                    {returnRequest.status === ReturnStatus.PENDING && (
                        <>
                            <button
                                onClick={() => handleStatusUpdate(ReturnStatus.APPROVED)}
                                disabled={updating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200 dark:shadow-none hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-50"
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve & Restock
                            </button>
                            <button
                                onClick={handleMarkReceived}
                                disabled={markingReceived || !!returnRequest.receivedAt}
                                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all disabled:opacity-50"
                            >
                                {markingReceived ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                                {returnRequest.receivedAt ? 'Items Received ✓' : 'Mark Items Received'}
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(ReturnStatus.REJECTED)}
                                disabled={updating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-red-600 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                                <X className="w-4 h-4" /> Reject Request
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(ReturnStatus.CANCELLED)}
                                disabled={updating}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                Cancel Request
                            </button>
                        </>
                    )}

                    {/* RECEIVED actions */}
                    {returnRequest.status === ReturnStatus.RECEIVED && (
                        <>
                            <button
                                onClick={() => handleStatusUpdate(ReturnStatus.APPROVED)}
                                disabled={updating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve & Restock
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(ReturnStatus.REJECTED)}
                                disabled={updating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-red-600 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                                <X className="w-4 h-4" /> Reject
                            </button>
                        </>
                    )}

                    {/* APPROVED actions */}
                    {returnRequest.status === ReturnStatus.APPROVED && (
                        <button
                            onClick={() => handleStatusUpdate(ReturnStatus.REFUNDED, undefined, selectedRefundMethod)}
                            disabled={updating}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none disabled:opacity-50"
                        >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                            Finalize Refund via {REFUND_METHOD_LABELS[selectedRefundMethod]}
                        </button>
                    )}

                    {/* Terminal state indicators */}
                    {(returnRequest.status === ReturnStatus.REFUNDED || returnRequest.status === ReturnStatus.EXCHANGED) && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold border border-green-100 dark:border-green-900/30">
                            <Check className="w-4 h-4" /> {returnRequest.status === ReturnStatus.EXCHANGED ? 'Exchange Completed' : 'Refund Processed'}
                        </div>
                    )}
                    {(returnRequest.status === ReturnStatus.REJECTED || returnRequest.status === ReturnStatus.CANCELLED) && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 text-slate-500 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
                            <X className="w-4 h-4" /> Request {returnRequest.status}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 print:hidden">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items Section */}
                    <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="p-1.5 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                                    <Package className="w-5 h-5 text-brand-600" />
                                </div>
                                Returned Items
                            </h2>
                            <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 border border-slate-100 dark:border-slate-700">
                                {returnRequest.items.length} {returnRequest.items.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>
                        <div className="p-6 space-y-4">
                            {returnRequest.items.map((returnItem: any, index: number) => {
                                const orderItem = returnRequest.order?.items?.find(
                                    (oi: any) => oi.productId === returnItem.productId &&
                                        (oi.variantId === returnItem.variantId || (!oi.variantId && !returnItem.variantId))
                                );

                                const productName = orderItem?.product?.name || "Product Unavailable";
                                const productImage = orderItem?.product?.images?.[0];
                                const variantSku = orderItem?.variant?.sku;
                                const variantOptions = orderItem?.variant?.combination;
                                const unitPrice = orderItem ? (Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0)) : 0;

                                return (
                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 group hover:border-brand-200 dark:hover:border-brand-900/30 transition-all">
                                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-100 dark:border-slate-700">
                                            {productImage ? (
                                                <img src={productImage} alt={productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                                                        {productName}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                        {variantSku && (
                                                            <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest px-1.5 py-0.5 bg-brand-50 dark:bg-brand-900/20 rounded">
                                                                SKU: {variantSku}
                                                            </span>
                                                        )}
                                                        {variantOptions && (
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic font-medium">
                                                                {Object.entries(variantOptions).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Refund Est.</p>
                                                    <p className="text-lg font-black text-green-600 leading-none">
                                                        {formatPrice(unitPrice * returnItem.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-xs">
                                                    <div>
                                                        <span className="text-slate-400 font-bold uppercase tracking-tighter mr-1.5">Qty:</span>
                                                        <span className="font-bold text-slate-900 dark:text-white">{returnItem.quantity}</span>
                                                    </div>
                                                    <span className="text-slate-200">|</span>
                                                    <div>
                                                        <span className="text-slate-400 font-bold uppercase tracking-tighter mr-1.5">Net Price:</span>
                                                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatPrice(unitPrice)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Reason Section */}
                        <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                            <h2 className="text-md font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <MessageSquare className="w-4 h-4 text-amber-600" />
                                </div>
                                Return Reason
                            </h2>
                            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm italic font-medium">
                                    "{returnRequest.reason}"
                                </p>
                            </div>
                        </section>

                        {/* Admin Comment Section */}
                        <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                            <h2 className="text-md font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <div className="p-1.5 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-brand-600" />
                                </div>
                                Resolution Notes
                            </h2>
                            {returnRequest.adminComment ? (
                                <div className="bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100/50 dark:border-brand-900/20 p-4 rounded-2xl">
                                    <p className="text-slate-700 dark:text-slate-300 text-sm italic font-medium">
                                        "{returnRequest.adminComment}"
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[80px] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                    <p className="text-slate-400 italic text-xs">No resolution notes provided.</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Original Order */}
                    <section className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl shadow-lg shadow-brand-200 dark:shadow-none p-6 text-white overflow-hidden relative group">
                        <ShoppingBag className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-80">Connected Order</h3>
                        <Link
                            href={`/admin/orders/${returnRequest.orderId}`}
                            className="block bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-4 transition-all border border-white/20 group/link"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-mono text-xl font-black uppercase tracking-tighter">
                                    #{returnRequest.order?.id?.slice(-8)}
                                </p>
                                <div className="p-2 bg-white/20 rounded-lg group-hover/link:translate-x-1 transition-transform">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-xs font-bold opacity-70">View Original Order & Transaction History</p>
                        </Link>
                    </section>

                    {/* Customer Profile */}
                    <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Customer Profile</h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <Package className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Customer Name</p>
                                    <p className="font-bold text-slate-900 dark:text-white truncate">{returnRequest.order?.customerName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Email Address</p>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm break-all">{returnRequest.user?.email || returnRequest.order?.customerEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Phone Number</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{returnRequest.order?.customerPhone}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Status Timeline */}
                    <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Request Timeline</h3>
                        <div className="space-y-0">
                            {/* Step 1: Requested */}
                            <div className="relative pl-8 pb-8">
                                <div className="absolute left-[7px] top-0 h-full w-[2px] bg-brand-100 dark:bg-brand-900/30" />
                                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-brand-500 border-4 border-white dark:border-slate-800 z-10 shadow-sm shadow-brand-200" />
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-0.5">Return Requested</p>
                                <p className="text-[10px] text-slate-500 font-medium">Validated by system on {new Date(returnRequest.createdAt).toLocaleDateString()}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(returnRequest.createdAt).toLocaleTimeString()}</p>
                            </div>

                            {/* Step 2: Current Status */}
                            <div className="relative pl-8">
                                <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 z-10 ${returnRequest.status === ReturnStatus.PENDING ? 'bg-slate-200' : 'bg-brand-500 shadow-sm shadow-brand-200'}`} />
                                <p className={`text-xs font-black uppercase tracking-tighter mb-0.5 ${returnRequest.status === ReturnStatus.PENDING ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                    Status Update: {returnRequest.status}
                                </p>
                                {returnRequest.updatedAt !== returnRequest.createdAt ? (
                                    <>
                                        <p className="text-[10px] text-slate-500 font-medium italic">Latest modification recorded</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(returnRequest.updatedAt).toLocaleString()}</p>
                                    </>
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic">Waiting for admin review...</p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
