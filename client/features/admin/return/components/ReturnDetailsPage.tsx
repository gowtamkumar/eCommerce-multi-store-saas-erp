"use client";

import { useSettings } from "@/hooks/SettingsContext";
import { fetchAPI } from "@/services/api";
import { ReturnStatus } from "@/lib/enums/return-status";
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
    ShoppingBag,
    History,
    AlertCircle
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

    const handleStatusUpdate = async (status: string, comment?: string) => {
        setUpdating(true);
        try {
            const res = await fetchAPI(`/returns/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status, comment }),
            });

            if (res.success || (res.data && res.data.id)) {
                setReturnRequest(res.data || res);
                toast.success(`Return request ${status} successfully`);
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error("Failed to update return status", error);
            toast.error("An error occurred");
        } finally {
            setUpdating(false);
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
            case "approved":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "rejected":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "refunded":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            default:
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        }
    };

    return (
        <div className="max-w-full mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <Link
                        href="/admin/returns"
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Returns
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
                        Return Request{" "}
                        <span className="text-slate-400 font-mono text-xl sm:text-2xl uppercase">
                            #{returnRequest.id.slice(-8)}
                        </span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span>Requested on {new Date(returnRequest.createdAt).toLocaleString()}</span>
                        </div>
                        <span
                            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${getStatusStyles(
                                returnRequest.status || "PENDING"
                            )}`}
                        >
                            {returnRequest.status}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    {returnRequest.status === "pending" && (
                        <>
                            <button
                                onClick={() => handleStatusUpdate("rejected")}
                                disabled={updating}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" /> Reject
                            </button>
                            <button
                                onClick={() => handleStatusUpdate("approved")}
                                disabled={updating}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" /> Approve
                            </button>
                        </>
                    )}
                    {returnRequest.status === "approved" && (
                        <button
                            onClick={() => handleStatusUpdate("refunded")}
                            disabled={updating}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" /> Mark as Refunded
                        </button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items Section */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Package className="w-4 sm:w-5 h-4 sm:h-5 text-brand-500" />
                                Returned Items
                            </h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            {returnRequest.items.map((returnItem: any, index: number) => {
                                const orderItem = returnRequest.order?.items?.find(
                                    (oi: any) => oi.productId === returnItem.productId &&
                                        (oi.variantId === returnItem.variantId || (!oi.variantId && !returnItem.variantId))
                                );

                                const productName = orderItem?.product?.name || "Product Unavailable";
                                const productImage = orderItem?.product?.images?.[0];
                                const variantSku = orderItem?.variant?.sku;
                                const variantOptions = orderItem?.variant?.combination;

                                return (
                                    <div key={index} className="flex items-center gap-4 sm:gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-100 dark:border-slate-700">
                                            {productImage ? (
                                                <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                                                {productName}
                                            </p>
                                            {variantSku && (
                                                <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-1">
                                                    SKU: {variantSku}
                                                </p>
                                            )}
                                            {variantOptions && (
                                                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">
                                                    {Object.entries(variantOptions).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                                </p>
                                            )}
                                            <div className="mt-2 flex items-center gap-4">
                                                <div className="text-xs sm:text-sm">
                                                    <span className="text-slate-500">Return Qty:</span>
                                                    <span className="ml-1 font-bold text-slate-900 dark:text-white">{returnItem.quantity}</span>
                                                </div>
                                                <span className="text-slate-200">|</span>
                                                <div className="text-xs sm:text-sm">
                                                    <span className="text-slate-500">Refund Est:</span>
                                                    <span className="ml-1 font-bold text-green-600">
                                                        {orderItem ? formatPrice((Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0)) * returnItem.quantity) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Reason Section */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-brand-500" />
                            Return Reason
                        </h2>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {returnRequest.reason}
                            </p>
                        </div>
                    </section>

                    {/* Admin Comment Section */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-brand-500" />
                            Resolution Notes
                        </h2>
                        {returnRequest.adminComment ? (
                            <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/20 p-4 rounded-xl">
                                <p className="text-slate-700 dark:text-slate-300 italic">
                                    "{returnRequest.adminComment}"
                                </p>
                            </div>
                        ) : (
                            <p className="text-slate-400 italic text-sm">No notes provided for this resolution.</p>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Order Link */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Original Order</h3>
                        <Link
                            href={`/admin/orders/${returnRequest.orderId}`}
                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-800 group"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 text-brand-500" />
                                <div>
                                    <p className="font-mono font-bold text-slate-900 dark:text-white uppercase leading-none">
                                        #{returnRequest.order?.id?.slice(-8)}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase">View Order Details</p>
                                </div>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </section>

                    {/* Customer details */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Customer Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <Package className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Name</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{returnRequest.order?.customerName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Email</p>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm break-all">{returnRequest.user?.email || returnRequest.order?.customerEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Phone</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{returnRequest.order?.customerPhone}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Activity Log</h3>
                        <div className="space-y-6">
                            <div className="relative pl-6 pb-6 border-l-2 border-brand-100 dark:border-brand-900/50">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-500 border-4 border-white dark:border-slate-800" />
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">Return Requested</p>
                                <p className="text-[10px] text-slate-500 mt-1">{new Date(returnRequest.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="relative pl-6">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 ${returnRequest.status === 'pending' ? 'bg-slate-200' : 'bg-brand-500'}`} />
                                <p className={`text-xs font-bold leading-none ${returnRequest.status === 'pending' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                    Status: <span className="uppercase">{returnRequest.status}</span>
                                </p>
                                {returnRequest.updatedAt !== returnRequest.createdAt && (
                                    <p className="text-[10px] text-slate-500 mt-1">{new Date(returnRequest.updatedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
