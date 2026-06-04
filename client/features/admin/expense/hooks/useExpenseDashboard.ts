'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import type { Expense, PaginationMeta } from '../types';

export function useExpenseDashboard() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1, limit: 20, total: 0, totalPages: 0,
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchExpenses = useCallback(async (page: number, q: string, category: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(q && { q }),
                ...(category && { category }),
            });
            const res = await fetchAPI(`/expenses?${params}`);
            if (res.success && res.data) {
                setExpenses(res.data.items || []);
                setPagination({
                    page: res.data.page,
                    limit: res.data.limit,
                    total: res.data.total,
                    totalPages: res.data.totalPages,
                });
            }
        } catch (error) {
            console.error('Failed to fetch expenses', error);
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchExpenses(1, debouncedSearch, categoryFilter);
    }, [debouncedSearch, categoryFilter, fetchExpenses]);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        try {
            const res = await fetchAPI(`/expenses/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Expense deleted successfully');
                void fetchExpenses(pagination.page, debouncedSearch, categoryFilter);
            }
        } catch {
            toast.error('Error deleting expense');
        }
    }, [pagination.page, debouncedSearch, categoryFilter, fetchExpenses]);

    const handleEdit = useCallback((expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    }, []);

    const handleAdd = useCallback(() => {
        setEditingExpense(null);
        setIsFormOpen(true);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void fetchExpenses(newPage, debouncedSearch, categoryFilter);
        }
    }, [pagination.totalPages, debouncedSearch, categoryFilter, fetchExpenses]);

    return {
        expenses,
        loading,
        isFormOpen,
        setIsFormOpen,
        editingExpense,
        setEditingExpense,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        pagination,
        debouncedSearch,
        fetchExpenses,
        handleDelete,
        handleEdit,
        handleAdd,
        handlePageChange,
    };
}
