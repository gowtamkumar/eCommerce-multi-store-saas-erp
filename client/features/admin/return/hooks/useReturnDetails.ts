"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import { ReturnRequest } from "@/types/order";
import { RefundMethod } from "@/lib/enums/refund-method.enum";

export function useReturnDetails(id: string) {
    const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [adminComment, setAdminComment] = useState("");
    const [selectedRefundMethod, setSelectedRefundMethod] = useState<RefundMethod>(RefundMethod.STORE_CREDIT);
    const [markingReceived, setMarkingReceived] = useState(false);

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

    useEffect(() => {
        if (id) {
            fetchReturn();
        }
    }, [id]);

    const handleStatusUpdate = async (status: string, comment?: string, refundMethod?: RefundMethod) => {
        setUpdating(true);
        try {
            const res = await fetchAPI(`/returns/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status, comment: comment || adminComment || undefined, refundMethod }),
            });

            if (res.success || (res.data && res.data.id)) {
                setReturnRequest(res.data || res);
                setAdminComment("");
                toast.success(`Return request ${status} successfully`);
            } else {
                toast.error(res.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Failed to update return status", error);
            toast.error("An error occurred");
        } finally {
            setUpdating(false);
        }
    };

    const handleMarkReceived = async () => {
        setMarkingReceived(true);
        try {
            const res = await fetchAPI(`/returns/${id}/received`, { method: "PATCH" });
            if (res.success || res.data?.id) {
                setReturnRequest(res.data);
                toast.success("Return items marked as received");
            } else {
                toast.error(res.message || "Failed to mark as received");
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setMarkingReceived(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        await fetchReturn();
        toast.success("Data refreshed");
    };

    return {
        returnRequest,
        loading,
        updating,
        adminComment,
        setAdminComment,
        selectedRefundMethod,
        setSelectedRefundMethod,
        markingReceived,
        handleStatusUpdate,
        handleMarkReceived,
        handleRefresh,
    };
}
