"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import type { Pagination, User } from "../type";

export function useCustomerDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        isDangerous: false,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchUsers = async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search: search,
            });
            const res = await fetchAPI(`/users?${params.toString()}`);

            if (res.success && res.data) {
                setUsers(res.data || []);
                setPagination(res.pagination || {
                    total: res.data?.length || 0,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                });
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchUsers(1, debouncedSearch);
    }, [debouncedSearch]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void fetchUsers(newPage, debouncedSearch);
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Customer",
            message: "Are you sure you want to delete this customer? This action cannot be undone and will remove all associated data.",
            isDangerous: true,
            onConfirm: async () => {
                try {
                    const res = await fetchAPI(`/users/${id}`, { method: "DELETE" });
                    if (res.success) {
                        setUsers((prev) => prev.filter((u) => u.id !== id));
                        toast.success("Customer deleted successfully");
                        void fetchUsers(pagination.page, debouncedSearch);
                    } else {
                        toast.error(res.message || "Error deleting customer");
                    }
                } catch (error) {
                    toast.error("Error deleting customer");
                } finally {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            },
        });
    };

    const handleFormSubmit = async (formData: any) => {
        try {
            const method = selectedUser ? "PATCH" : "POST";
            const url = selectedUser ? `/users/${selectedUser.id}` : "/users";

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (res.success) {
                toast.success(selectedUser ? "Customer updated successfully" : "Customer created successfully");
                void fetchUsers(pagination.page, debouncedSearch);
                setIsFormOpen(false);
            } else {
                toast.error(res.message || "Error saving customer");
                throw new Error(res.message);
            }
        } catch (error: any) {
            toast.error(error.message || "Error saving customer");
            throw error;
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    return {
        users,
        loading,
        searchQuery,
        setSearchQuery,
        pagination,
        isFormOpen,
        setIsFormOpen,
        selectedUser,
        confirmModal,
        setConfirmModal,
        handlePageChange,
        handleDelete,
        handleFormSubmit,
        handleEdit,
        handleAdd,
    };
}
