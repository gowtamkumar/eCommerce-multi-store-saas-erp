'use client';

import { fetchAPI } from '@/services/api';
import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import type { Expense, PaginationMeta } from '../types';
import { EXPENSE_CATEGORIES } from '../types';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import { useDebounce } from '@/hooks/useDebounce';
import { Filter, Search } from 'lucide-react';

export default function ExpenseComponent() {
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
        <div className="space-y-6 pb-10">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by title or reference number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="relative w-full md:w-52">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                        <option value="">All Categories</option>
                        {EXPENSE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <ExpenseList
                expenses={expenses}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                pagination={pagination}
                onPageChange={handlePageChange}
            />

            <ExpenseForm
                isOpen={isFormOpen}
                initialData={editingExpense}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    fetchExpenses(pagination.page, debouncedSearch, categoryFilter);
                }}
            />
        </div>
    );
}
