"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { fetchAPI } from "@/services/api";
import { ReturnRequest } from "../types";
import { RefundMethod } from "@/lib/enums/refund-method.enum";
import { useDebounce } from "@/hooks/useDebounce";

export function useReturnDashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // States
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
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

    return {
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
    };
}
