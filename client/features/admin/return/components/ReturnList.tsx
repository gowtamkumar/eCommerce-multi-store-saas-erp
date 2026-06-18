"use client";

import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { useSettings } from "@/hooks/SettingsContext";
import Link from "next/link";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ReturnRequest, ReturnListProps } from "../types";
import { RefundMethod, REFUND_METHOD_LABELS } from "@/lib/enums/refund-method.enum";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    received: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    exchanged: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400",
};

export default function ReturnList({ returns, loading, onStatusUpdate, onOpenAiAssist }: ReturnListProps) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { formatPrice } = useSettings();

    const handleQuickAction = useCallback(async (id: string, status: string) => {
        setUpdatingId(id);
        await onStatusUpdate(id, status);
        setUpdatingId(null);
    }, [onStatusUpdate]);

    const columns = useMemo<DataTableColumn<ReturnRequest>[]>(() => [
        {
            key: "order",
            header: "Order ID",
            className: "font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap",
            cell: (req) => `#${req.order?.id?.slice(-8).toUpperCase() ?? "N/A"}`,
        },
        {
            key: "customer",
            header: "Customer",
            className: "text-sm",
            cell: (req) => (
                <>
                    <div className="font-semibold text-slate-900 dark:text-white">
                        {req.order?.customerName ?? "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500">
                        {req.user?.email ?? req.order?.customerEmail}
                    </div>
                </>
            ),
        },
        {
            key: "type",
            header: "Type",
            className: "text-sm",
            cell: (req) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${req.returnType === 'exchange'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                    {req.returnType ?? 'refund'}
                </span>
            ),
        },
        {
            key: "items",
            header: "Items",
            className: "text-sm max-w-[140px]",
            cell: (req) => (
                <div className="flex flex-wrap gap-1">
                    {req.items.map((item, i) => (
                        <span
                            key={`${item.productId || 'item'}-${item.variantId || 'default'}-${i}`}
                            className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                            ×{item.quantity}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: "refundAmount",
            header: "Refund Amt",
            className: "text-sm font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap",
            cell: (req) => req.refundAmount != null
                ? formatPrice(Number(req.refundAmount))
                : <span className="text-slate-400 font-normal">-</span>,
        },
        {
            key: "method",
            header: "Method",
            className: "text-xs text-slate-600 dark:text-slate-400",
            cell: (req) => req.refundMethod
                ? REFUND_METHOD_LABELS[req.refundMethod as RefundMethod] ?? req.refundMethod
                : <span className="text-slate-400">-</span>,
        },
        {
            key: "status",
            header: "Status",
            cell: (req) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[req.status] ?? "bg-yellow-100 text-yellow-700"}`}>
                    {req.status}
                </span>
            ),
        },
        {
            key: "date",
            header: "Date",
            className: "text-sm text-slate-500 whitespace-nowrap",
            cell: (req) => new Date(req.createdAt).toLocaleDateString(),
        },
        {
            key: "actions",
            header: "Actions",
            cell: (req) => {
                const isUpdating = updatingId === req.id;
                return (
                    <div className="flex items-center gap-1.5">
                        {req.status === "pending" && (
                            <>
                                <button
                                    title="Approve & Restock"
                                    disabled={isUpdating}
                                    onClick={() => handleQuickAction(req.id, "approved")}
                                    className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors disabled:opacity-40"
                                >
                                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                    title="Reject"
                                    disabled={isUpdating}
                                    onClick={() => handleQuickAction(req.id, "rejected")}
                                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors disabled:opacity-40"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                        {onOpenAiAssist && (
                            <button
                                type="button"
                                title="AI refund explanation letter"
                                onClick={() => onOpenAiAssist(req)}
                                className="p-1.5 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <Link
                            href={`/admin/returns/${req.id}`}
                            className="text-brand-600 hover:text-brand-700 font-medium text-xs bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors border border-brand-100 shadow-sm whitespace-nowrap"
                        >
                            View →
                        </Link>
                    </div>
                );
            },
        },
    ], [formatPrice, handleQuickAction, onOpenAiAssist, updatingId]);

    return (
        <DataTable
            data={returns}
            columns={columns}
            getRowKey={(req) => req.id}
            loading={loading}
            loadingLabel="Loading return requests..."
            emptyLabel="No return requests found."
            containerClassName="rounded-xl border-slate-200 dark:border-slate-700"
            minWidthClassName="min-w-[1100px]"
        />
    );
}
