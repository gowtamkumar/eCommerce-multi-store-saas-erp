'use client';

import { fetchAPI } from '@/services/api';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { Expense, PaginationMeta } from '../types';
import ExpenseList from './ExpenseList';
import dynamic from 'next/dynamic';
import { useDebounce } from '@/hooks/useDebounce';

// Lazy load the form to optimize initial bundle
const ExpenseForm = dynamic(() => import('./ExpenseForm'), {
    loading: () => null
});

export default function ExpenseDashboard() {
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
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses(1, debouncedSearch, categoryFilter);
    }, [debouncedSearch, categoryFilter, fetchExpenses]);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        try {
            const res = await fetchAPI(`/expenses/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Expense deleted successfully');
                fetchExpenses(pagination.page, debouncedSearch, categoryFilter);
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
            fetchExpenses(newPage, debouncedSearch, categoryFilter);
        }
    }, [pagination.totalPages, debouncedSearch, categoryFilter, fetchExpenses]);

    return (
        <>
            <ExpenseList
                expenses={expenses}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                pagination={pagination}
                onPageChange={handlePageChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                isSearchLoading={debouncedSearch !== searchQuery}
            />

            {isFormOpen && (
                <ExpenseForm
                    isOpen={isFormOpen}
                    initialData={editingExpense}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchExpenses(pagination.page, debouncedSearch, categoryFilter);
                    }}
                />
            )}
        </>
    );
}
