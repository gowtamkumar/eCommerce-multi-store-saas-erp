"use client";
import { fetchAPI } from "@/services/api";
import { useCallback, useEffect, useState, memo } from "react";
import toast from "react-hot-toast";
import { ReturnRequest } from "@/types/order";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Isolated memoized row — prevents entire table re-rendering when one row's status updates
const ReturnRow = memo(({ req }: { req: ReturnRequest }) => {
    const statusStyles: Record<string, string> = {
        approved:  "bg-green-100 text-green-700",
        rejected:  "bg-red-100 text-red-700",
        refunded:  "bg-blue-100 text-blue-700",
        pending:   "bg-yellow-100 text-yellow-700",
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate-300">
                #{req.order?.id?.slice(-8).toUpperCase() ?? "N/A"}
            </td>
            <td className="p-4 text-sm">
                <div className="font-medium text-slate-900 dark:text-white">
                    {req.order?.customerName ?? "Unknown"}
                </div>
                <div className="text-xs text-slate-500">
                    {req.user?.email ?? req.order?.customerEmail}
                </div>
            </td>
            <td className="p-4 text-sm max-w-xs">
                <div className="space-y-1">
                    {req.items.map((item: any, i: number) => (
                        <div
                            key={i}
                            className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded inline-block mr-1"
                        >
                            Qty: {item.quantity}
                        </div>
                    ))}
                </div>
            </td>
            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                {req.reason}
            </td>
            <td className="p-4">
                <span
                    className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        statusStyles[req.status] ?? "bg-yellow-100 text-yellow-700"
                    }`}
                >
                    {req.status}
                </span>
            </td>
            <td className="p-4 text-sm text-slate-500">
                {new Date(req.createdAt).toLocaleDateString()}
            </td>
            <td className="p-4">
                <Link
                    href={`/admin/returns/${req.id}`}
                    className="text-brand-600 hover:text-brand-700 font-medium text-sm bg-brand-50 px-3 py-1.5 rounded-lg transition-colors border border-brand-100"
                >
                    View Details
                </Link>
            </td>
        </tr>
    );
});
ReturnRow.displayName = "ReturnRow";


export default function ReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/returns");
            if (Array.isArray(res.data)) {
                setReturns(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch returns", error);
            toast.error("Failed to load return requests");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    const handleStatusUpdate = async (id: string, status: string, comment?: string) => {
        try {
            const res = await fetchAPI(`/returns/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status, comment }),
            });

            if (res.success || (res.data && res.data.id)) {
                toast.success(`Return request ${status}`);
                // Surgical update — avoid full network re-fetch after each action
                setReturns((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: status as any } : r))
                );
                setSelectedReturn(null);
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred while updating the return");
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                Return Requests
            </h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm">
                                <th className="p-4 font-medium">Order ID</th>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Items</th>
                                <th className="p-4 font-medium">Reason</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                                            <span className="font-medium">Loading returns...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : returns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        No return requests found.
                                    </td>
                                </tr>
                            ) : (
                                returns.map((req) => (
                                    <ReturnRow key={req.id} req={req} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
