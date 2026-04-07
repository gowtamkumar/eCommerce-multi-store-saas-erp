'use client';

import { useSettings } from '@/hooks/SettingsContext';
import dayjs from 'dayjs';
import { Edit2, Plus, Receipt, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ExpenseListProps } from '../types';

export default function ExpenseList({
    expenses,
    loading,
    onEdit,
    onDelete,
    onAdd,
}: ExpenseListProps) {
    const { formatPrice } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredExpenses = expenses.filter(expense =>
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-rose-500" />
                        Expenses
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage your business expenditures</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-xl transition-all font-medium shadow-sm shadow-brand-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Record Expense
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title, ref, or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
                </div>

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
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                                        </div>
                                        Loading expenses...
                                    </td>
                                </tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                            <p>No expenses recorded yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap text-sm">
                                            {dayjs(expense.expenseDate).format('MMM D, YYYY')}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900 dark:text-white capitalize truncate max-w-xs">{expense.title}</p>
                                            {expense.referenceNumber && (
                                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest leading-none font-mono">Ref: {expense.referenceNumber}</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap tracking-tight">
                                            - {formatPrice(expense.amount)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => onEdit(expense)}
                                                    className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    title="Edit Expense"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(expense.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    title="Delete Expense"
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
        </div>
    );
}
