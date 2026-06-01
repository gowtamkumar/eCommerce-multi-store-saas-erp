'use client';

import { useSettings } from '@/hooks/SettingsContext';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Edit2, Filter, Plus, Receipt, Search, Trash2 } from 'lucide-react';
import { memo } from 'react';
import type { ExpenseListProps } from '../types';
import { EXPENSE_CATEGORIES } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
    shipping: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400',
    packaging: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
    marketing: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
    software: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    salaries: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400',
    utilities: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
    maintenance: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300',
    other: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400',
};

const ExpenseRow = memo(({ expense, onEdit, onDelete, formatPrice }: {
    expense: any,
    onEdit: (e: any) => void,
    onDelete: (id: string) => void,
    formatPrice: (n: number) => string,
}) => (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group animate-in fade-in duration-200">
        <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
            {dayjs(expense.expenseDate).format('MMM D, YYYY')}
        </td>
        <td className="px-6 py-5">
            <p className="font-bold text-slate-900 dark:text-white capitalize truncate max-w-xs">{expense.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
                {expense.referenceNumber && (
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Ref: {expense.referenceNumber}</p>
                )}
                {expense.status && expense.status !== 'APPROVED' && (
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${
                        expense.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        : expense.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                        {expense.status.replace(/_/g, ' ')}
                    </span>
                )}
                {expense.recurrence && expense.recurrence !== 'NONE' && (
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                        ↻ {expense.recurrence.toLowerCase()}
                    </span>
                )}
                {expense.attachmentUrl && (
                    <a
                        href={expense.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-300"
                        title="Open receipt"
                    >
                        ↗ Receipt
                    </a>
                )}
            </div>
        </td>
        <td className="px-6 py-5">
            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl border ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.OTHER}`}>
                {expense.category}
            </span>
        </td>
        <td className="px-6 py-5 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap tracking-tight font-mono">
            − {formatPrice(expense.amount)}
        </td>
        <td className="px-6 py-5">
            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(expense)}
                    className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Edit Expense"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(expense.id)}
                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Delete Expense"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </td>
    </tr>
));
ExpenseRow.displayName = 'ExpenseRow';

export default function ExpenseList({
    expenses,
    loading,
    onEdit,
    onDelete,
    onAdd,
    pagination,
    onPageChange,
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryFilterChange,
    isSearchLoading
}: ExpenseListProps) {
    const { formatPrice } = useSettings();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-rose-500" />
                        </span>
                        Expenditures
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 ml-1">Track and manage business expenditures</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-5 py-3 bg-brand-600 text-white hover:bg-brand-700 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Record Expenditure
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-300">
                <div className="relative flex-1 group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchLoading ? 'text-brand-500 animate-spin' : 'text-slate-400 group-focus-within:text-brand-500'}`} />
                    <input
                        type="text"
                        placeholder="Search by title or reference number..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="relative w-full md:w-52">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => onCategoryFilterChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                        <option value="">All Categories</option>
                        {EXPENSE_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction Date</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Classification</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Fiscal Value</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading && !expenses.length ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-6 py-6 text-center">
                                            <div className="h-10 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt className="w-8 h-8 text-rose-300" strokeWidth={1} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No expenditures recorded</p>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map(expense => (
                                    <ExpenseRow
                                        key={expense.id}
                                        expense={expense}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        formatPrice={formatPrice}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination && pagination.totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Page <span className="text-slate-900 dark:text-white px-1">{pagination.page}</span>
                            of <span className="text-slate-900 dark:text-white px-1">{pagination.totalPages}</span>
                            <span className="ml-2 text-slate-400">({pagination.total} records)</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange?.(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onPageChange?.(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
