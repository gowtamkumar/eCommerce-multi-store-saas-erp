"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { fetchAPI } from "@/services/api";
import { ReturnRequest } from "../types";
import ReturnList from "./ReturnList";
import Pagination from "@/components/shared/Pagination";
import { useDebounce } from "@/hooks/useDebounce";

export default function ReturnDashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

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
    const [searchTerm, setSearchTerm] = useState(currentSearch);
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Sync search input with URL if it changes (e.g. back button)
    useEffect(() => {
        setSearchTerm(currentSearch);
    }, [currentSearch]);

    // Update URL when debounced search changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }
        params.set("page", "1"); // Reset to page 1 on search
        router.push(`${pathname}?${params.toString()}`);
    }, [debouncedSearch, pathname, router]);

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(currentPage),
                limit: String(pagination.limit),
                search: currentSearch,
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
    }, [currentPage, currentSearch, pagination.limit]);

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
                setReturns((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: status as any } : r))
                );
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred while updating the return");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                        Return Requests
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage customer return requests and inventory restock.
                    </p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID, customer, or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <ReturnList 
                returns={returns} 
                loading={loading} 
                onStatusUpdate={handleStatusUpdate} 
            />

            {!loading && returns.length > 0 && (
                <div className="mt-8 flex flex-col items-center gap-4">
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

