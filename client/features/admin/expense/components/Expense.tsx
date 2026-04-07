'use client';

import { fetchAPI } from '@/services/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Expense } from '../types';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';

export default function Expense() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await fetchAPI('/expenses');
            if (res.success) {
                setExpenses(res.data || []);
            }
        } catch (error) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            const res = await fetchAPI(`/expenses/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Expense deleted successfully');
                fetchExpenses();
            }
        } catch (error) {
            toast.error('Error deleting expense');
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingExpense(null);
        setIsFormOpen(true);
    };

    return (
        <div className="pb-10">
            <ExpenseList
                expenses={expenses}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
            />

            <ExpenseForm
                isOpen={isFormOpen}
                initialData={editingExpense}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    fetchExpenses();
                }}
            />
        </div>
    );
}
