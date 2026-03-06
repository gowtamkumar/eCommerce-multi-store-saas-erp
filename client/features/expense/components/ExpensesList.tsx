'use client';

import { useSettings } from '@/hooks/SettingsContext';
import dayjs from 'dayjs';
import { Edit2, Plus, Receipt, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ExpenseFormModal from './ExpenseFormModal';
import { fetchAPI } from '@/services/api';

export default function ExpensesList() {
    const { formatPrice } = useSettings();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const data = await fetchAPI('/expenses');
            setExpenses(data.data);
        } catch (error) {
            toast.error('Failed to load expenses');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await fetchAPI(`/expenses/${id}`, { method: 'DELETE' });
            toast.success('Expense deleted successfully');
            fetchExpenses();
        } catch (error) {
            toast.error('Error deleting expense');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-rose-500" />
                        Expenses
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage your business expenses</p>
                </div>
                <button
                    onClick={() => { setEditingExpense(null); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-xl transition-all font-medium shadow-sm shadow-brand-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Record Expense
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Title & Ref</th>
                                <th className="p-4 font-medium">Category</th>
                                <th className="p-4 font-medium text-right">Amount</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading expenses...</td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                            <p>No expenses recorded yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {dayjs(expense.expenseDate).format('MMM D, YYYY')}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium text-slate-900 dark:text-white capitalize truncate max-w-xs">{expense.title}</p>
                                            {expense.referenceNumber && (
                                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Ref: {expense.referenceNumber}</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 capitalize tracking-wide">
                                                {expense.category.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                                            - {formatPrice(expense.amount)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingExpense(expense); setIsFormOpen(true); }}
                                                    className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <ExpenseFormModal
                    expense={editingExpense}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => { setIsFormOpen(false); fetchExpenses(); }}
                />
            )}
        </div>
    );
}
