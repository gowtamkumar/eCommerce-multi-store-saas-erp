"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    BookOpen, ArrowUpCircle, ArrowDownCircle, Loader2, RefreshCw,
    Search, Filter, Package, ChevronLeft, ChevronRight
} from "lucide-react";
import { fetchAPI } from "@/services/api";
import toast from "react-hot-toast";

interface LedgerEntry {
    id: string;
    createdAt: string;
    type: string;
    quantity: number;
    unitCost: number;
    cogsAmount: number;
    balanceAfter: number;
    remainingQuantity: number;
    referenceType: string;
    referenceId: string;
    remarks: string;
    product?: { name: string; images?: string[] };
    warehouse?: { name: string };
    user?: { name: string };
}

const TYPE_COLORS: Record<string, string> = {
    PURCHASE: "emerald",
    SALE: "blue",
    RETURN: "violet",
    SALES_RETURN: "violet",
    ADJUSTMENT: "amber",
    TRANSFER_IN: "cyan",
    TRANSFER_OUT: "orange",
    INITIAL_BALANCE: "slate",
};

const TYPE_LABELS: Record<string, string> = {
    PURCHASE: "Purchase",
    SALE: "Sale",
    RETURN: "Return",
    SALES_RETURN: "Sales Return",
    ADJUSTMENT: "Adjustment",
    TRANSFER_IN: "Transfer In",
    TRANSFER_OUT: "Transfer Out",
    INITIAL_BALANCE: "Opening Balance",
};

function fmt(v: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v || 0);
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function GeneralLedgerPage() {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const LIMIT = 20;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
            if (search) params.set("q", search);
            if (typeFilter) params.set("type", typeFilter);
            const res = await fetchAPI(`/inventory-ledger?${params.toString()}`);
            setEntries(res?.data?.items || []);
            setTotal(res?.data?.total || 0);
        } catch {
            toast.error("Failed to load ledger entries");
        } finally { setLoading(false); }
    }, [page, search, typeFilter]);

    useEffect(() => { load(); }, [load]);

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-violet-600" /> General Ledger
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Complete immutable audit trail of all inventory movements.
                    </p>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all w-fit">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by product or reference..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none transition-all"
                    >
                        <option value="">All Types</option>
                        {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-bold">No ledger entries found</p>
                        <p className="text-sm mt-1">Make a purchase or sale to start tracking inventory movements.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    {["Date", "Product", "Type", "Qty", "Unit Cost", "COGS", "Balance", "Warehouse", "Reference"].map(h => (
                                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, i) => {
                                    const color = TYPE_COLORS[entry.type] || "slate";
                                    const isIn = entry.quantity > 0;
                                    return (
                                        <motion.tr
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{fmtDate(entry.createdAt)}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    {entry.product?.images?.[0] ? (
                                                        <img src={entry.product.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                                                        {entry.product?.name || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-${color}-50 text-${color}-700 dark:bg-${color}-900/20 dark:text-${color}-400`}>
                                                    {isIn ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                                                    {TYPE_LABELS[entry.type] || entry.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm font-black ${isIn ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                    {isIn ? "+" : ""}{entry.quantity}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {entry.unitCost ? fmt(entry.unitCost) : "—"}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-amber-600 dark:text-amber-400 font-semibold">
                                                {entry.cogsAmount ? fmt(entry.cogsAmount) : "—"}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {entry.balanceAfter}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-400">
                                                {entry.warehouse?.name || "—"}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-400 font-mono truncate max-w-[100px]">
                                                {entry.referenceId || "—"}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-slate-400">{total} entries total</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 px-2">
                                {page} / {totalPages}
                            </span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
