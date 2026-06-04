"use client";

import { Search, AlertTriangle, CheckCircle2, RefreshCw, DollarSign } from "lucide-react";
import ReturnList from "./ReturnList";
import Pagination from "@/components/shared/Pagination";
import { useSettings } from "@/hooks/SettingsContext";
import { useReturnDashboard } from "../hooks/useReturnDashboard";

const STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "received", label: "Received" },
    { value: "refunded", label: "Refunded" },
    { value: "exchanged", label: "Exchanged" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
];

export default function ReturnDashboard() {
    const { formatPrice } = useSettings();

    const {
        returns,
        loading,
        pagination,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        handleStatusUpdate,
        stats,
        pathname,
    } = useReturnDashboard();

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                        Return Requests
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage customer return, refund, and exchange requests.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.approved}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                        <RefreshCw className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refunded</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.refunded}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                        <DollarSign className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Refunded</p>
                        <p className="text-xl font-black text-brand-600 dark:text-brand-400">
                            {formatPrice(stats.totalRefundAmount)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID, customer, or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm text-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm min-w-[160px] text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <ReturnList
                returns={returns}
                loading={loading}
                onStatusUpdate={handleStatusUpdate}
            />

            {!loading && returns.length > 0 && (
                <div className="mt-6 flex flex-col items-center gap-4">
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        baseUrl={pathname}
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing {returns.length} of {pagination.total} results
                    </p>
                </div>
            )}
        </div>
    );
}
