"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useDownloadInvoice } from "@/lib/handleDownloadInvoice";
import { Invoice, InvoiceResponse } from "../types";

export function useInvoicesDashboard() {
    const { downloadInvoice } = useDownloadInvoice();
    
    // State management
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchInvoices = useCallback(async (page: number, search: string, status: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                ...(search && { q: search }),
                ...(status && { status }),
            });

            const res = await fetchAPI(`/invoices?${params}`);
            
            if (res.success && res.data) {
                const data = res.data as InvoiceResponse;
                setInvoices(data.items);
                setPagination({
                    page: data.page,
                    limit: data.limit,
                    total: data.total,
                    totalPages: data.totalPages,
                });
            }
        } catch {
            toast.error("Failed to fetch invoices");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void fetchInvoices(1, debouncedSearch, statusFilter);
        }, 0);
        return () => window.clearTimeout(timeout);
    }, [debouncedSearch, statusFilter, fetchInvoices]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void fetchInvoices(newPage, debouncedSearch, statusFilter);
        }
    };

    const handleDownload = useCallback((invoice: Invoice) => {
        downloadInvoice({
            ...invoice.order,
            invoiceNumber: invoice.invoiceNumber,
        });
    }, [downloadInvoice]);

    const handleView = useCallback((invoice: Invoice) => {
        setSelectedInvoice(invoice);
    }, []);

    return {
        invoices,
        isLoading,
        selectedInvoice,
        setSelectedInvoice,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        pagination,
        handlePageChange,
        handleDownload,
        handleView,
    };
}
