"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAPI } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import { Supplier } from "../types";
import toast from "react-hot-toast";

export function useSuppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

    const debouncedSearch = useDebounce(searchQuery, 400);

    const loadSuppliers = useCallback(async (currentPage: number, search: string) => {
        setLoading(true);
        setIsSearchLoading(!!search);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                ...(search && { q: search }),
            });
            const res = await fetchAPI(`/suppliers?${params}`);
            if (res && res.success && res.data) {
                setSuppliers(res.data.items || []);
                setPagination({
                    page: res.data.page || 1,
                    limit: res.data.limit || 10,
                    total: res.data.total || 0,
                    totalPages: res.data.totalPages || 1,
                });
            }
        } catch (error) {
            console.error("Failed to load suppliers:", error);
            toast.error("Failed to load suppliers");
        } finally {
            setLoading(false);
            setIsSearchLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSuppliers(page, debouncedSearch);
    }, [page, debouncedSearch, loadSuppliers]);

    // Reset to page 1 on search change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const handleAdd = () => {
        setEditingSupplier(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                await fetchAPI(`/suppliers/${id}`, { method: "DELETE" });
                toast.success("Supplier deleted successfully");
                void loadSuppliers(page, debouncedSearch);
            } catch (error) {
                console.error("Failed to delete supplier:", error);
                toast.error("Failed to delete supplier");
            }
        }
    };

    const handleSuccess = () => {
        void loadSuppliers(page, debouncedSearch);
    };

    return {
        suppliers,
        loading,
        searchQuery,
        setSearchQuery,
        isSearchLoading,
        page,
        setPage,
        pagination,
        isModalOpen,
        setIsModalOpen,
        editingSupplier,
        handleAdd,
        handleEdit,
        handleDelete,
        handleSuccess,
    };
}
