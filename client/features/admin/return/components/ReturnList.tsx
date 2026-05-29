"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import { ReturnRequest, ReturnListProps } from "../types";
import { RefundMethod, REFUND_METHOD_LABELS } from "@/lib/enums/refund-method.enum";
import { useSettings } from "@/hooks/SettingsContext";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    received: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    exchanged: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400",
};

const ReturnRow = memo(
    ({
        req,
        onStatusUpdate,
        updatingId,
    }: {
        req: ReturnRequest;
        onStatusUpdate: ReturnListProps["onStatusUpdate"];
        updatingId: string | null;
    }) => {
        const { formatPrice } = useSettings();
        const isUpdating = updatingId === req.id;

        return (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                {/* Order ID */}
                <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    #{req.order?.id?.slice(-8).toUpperCase() ?? "N/A"}
                </td>

                {/* Customer */}
                <td className="p-4 text-sm">
                    <div className="font-semibold text-slate-900 dark:text-white">
                        {req.order?.customerName ?? "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500">
                        {req.user?.email ?? req.order?.customerEmail}
                    </div>
                </td>

                {/* Type */}
                <td className="p-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${req.returnType === 'exchange'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                        {req.returnType ?? 'refund'}
                    </span>
                </td>

                {/* Items */}
                <td className="p-4 text-sm max-w-[140px]">
                    <div className="flex flex-wrap gap-1">
                        {req.items.map((item: any, i: number) => (
                            <span
                                key={i}
                                className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-medium"
                            >
                                ×{item.quantity}
                            </span>
                        ))}
                    </div>
                </td>

                {/* Refund Amount */}
                <td className="p-4 text-sm font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                    {req.refundAmount != null
                        ? formatPrice(Number(req.refundAmount))
                        : <span className="text-slate-400 font-normal">—</span>}
                </td>

                {/* Refund Method */}
                <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                    {req.refundMethod
                        ? REFUND_METHOD_LABELS[req.refundMethod as RefundMethod] ?? req.refundMethod
                        : <span className="text-slate-400">—</span>}
                </td>

                {/* Status */}
                <td className="p-4">
                    <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[req.status] ?? "bg-yellow-100 text-yellow-700"
                            }`}
                    >
                        {req.status}
                    </span>
                </td>

                {/* Date */}
                <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                </td>

                {/* Quick Actions */}
                <td className="p-4">
                    <div className="flex items-center gap-1.5">
                        {req.status === "pending" && (
                            <>
                                <button
                                    title="Approve & Restock"
                                    disabled={isUpdating}
                                    onClick={() => onStatusUpdate(req.id, "approved")}
                                    className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors disabled:opacity-40"
                                >
                                    {isUpdating ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Check className="w-3.5 h-3.5" />
                                    )}
                                </button>
                                <button
                                    title="Reject"
                                    disabled={isUpdating}
                                    onClick={() => onStatusUpdate(req.id, "rejected")}
                                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors disabled:opacity-40"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                        <Link
                            href={`/admin/returns/${req.id}`}
                            className="text-brand-600 hover:text-brand-700 font-medium text-xs bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors border border-brand-100 shadow-sm whitespace-nowrap"
                        >
                            View →
                        </Link>
                    </div>
                </td>
            </tr>
        );
    }
);
ReturnRow.displayName = "ReturnRow";

export default function ReturnList({ returns, loading, onStatusUpdate }: ReturnListProps) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleQuickAction = async (id: string, status: string) => {
        setUpdatingId(id);
        await onStatusUpdate(id, status);
        setUpdatingId(null);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold">Order ID</th>
                            <th className="p-4 font-bold">Customer</th>
                            <th className="p-4 font-bold">Type</th>
                            <th className="p-4 font-bold">Items</th>
                            <th className="p-4 font-bold">Refund Amt</th>
                            <th className="p-4 font-bold">Method</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold">Date</th>
                            <th className="p-4 font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="p-12 text-center text-slate-500">
                                    <div className="flex items-center justify-center gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                                        <span className="font-semibold text-lg">Loading return requests...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : returns.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-slate-500 font-medium italic">
                                    No return requests found.
                                </td>
                            </tr>
                        ) : (
                            returns.map((req) => (
                                <ReturnRow
                                    key={req.id}
                                    req={req}
                                    onStatusUpdate={handleQuickAction}
                                    updatingId={updatingId}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
