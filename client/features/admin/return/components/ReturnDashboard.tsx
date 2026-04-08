"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import { ReturnRequest } from "../types";
import ReturnList from "./ReturnList";

export default function ReturnDashboard() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);

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
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white font-display">
                Return Requests
            </h1>

            <ReturnList 
                returns={returns} 
                loading={loading} 
                onStatusUpdate={handleStatusUpdate} 
            />
        </div>
    );
}
