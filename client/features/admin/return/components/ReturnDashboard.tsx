"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Loader2, AlertTriangle, CheckCircle2, RefreshCw, DollarSign } from "lucide-react";
import { fetchAPI } from "@/services/api";
import { ReturnRequest } from "../types";
import { RefundMethod } from "@/lib/enums/refund-method.enum";
import ReturnList from "./ReturnList";
import Pagination from "@/components/shared/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useSettings } from "@/hooks/SettingsContext";

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
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { formatPrice } = useSettings();

    // States
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
    });

    // Get params from URL
    const currentPage = Number(searchParams.get("page")) || 1;
    const currentSearch = searchParams.get("search") || "";
    const currentStatus = searchParams.get("status") || "";
    const [searchTerm, setSearchTerm] = useState(currentSearch);
    const [statusFilter, setStatusFilter] = useState(currentStatus);
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Sync search input with URL if it changes (e.g. back button)
    useEffect(() => {
        setSearchTerm(currentSearch);
        setStatusFilter(currentStatus);
    }, [currentSearch, currentStatus]);

    // Update URL when debounced search or status changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }
        if (statusFilter) {
            params.set("status", statusFilter);
        } else {
            params.delete("status");
        }
        params.set("page", "1"); // Reset to page 1 on filter
        router.push(`${pathname}?${params.toString()}`);
    }, [debouncedSearch, statusFilter, pathname, router]);

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(currentPage),
                limit: String(pagination.limit),
                search: currentSearch,
                ...(currentStatus ? { status: currentStatus } : {}),
            });

            const res = await fetchAPI(`/returns?${query.toString()}`);

            if (res.success && res.data) {
                setReturns(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch returns", error);
            toast.error("Failed to load return requests");
        } finally {
            setLoading(false);
        }
    }, [currentPage, currentSearch, currentStatus, pagination.limit]);

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    const handleStatusUpdate = async (
        id: string,
        status: string,
        comment?: string,
        refundMethod?: RefundMethod
    ) => {
        try {
            const res = await fetchAPI(`/returns/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status, comment, refundMethod }),
            });

            if (res.success || (res.data && res.data.id)) {
                toast.success(`Return request ${status}`);
                setReturns((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: status as any } : r))
                );
            } else {
                toast.error(res.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred while updating the return");
        }
    };

    // Derive stats from current page data
    const stats = {
        pending: returns.filter((r) => r.status === "pending").length,
        approved: returns.filter((r) => r.status === "approved" || r.status === "received").length,
        refunded: returns.filter((r) => r.status === "refunded").length,
        totalRefundAmount: returns
            .filter((r) => r.status === "refunded")
            .reduce((sum, r) => sum + Number(r.refundAmount || 0), 0),
    };

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
