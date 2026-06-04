'use client';

import React from 'react';
import type { Expense } from '../types';
import ExpenseList from './ExpenseList';
import dynamic from 'next/dynamic';
import { useExpenseDashboard } from '../hooks/useExpenseDashboard';

// Lazy load the form to optimize initial bundle
const ExpenseForm = dynamic(() => import('./ExpenseForm'), {
    loading: () => null
});

export default function ExpenseDashboard() {
    const {
        expenses,
        loading,
        isFormOpen,
        setIsFormOpen,
        editingExpense,
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
    } = useExpenseDashboard();

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
                        void fetchExpenses(pagination.page, debouncedSearch, categoryFilter);
                    }}
                />
            )}
        </>
    );
}
