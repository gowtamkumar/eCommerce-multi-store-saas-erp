'use client';

import { Mail, Phone, MapPin, User, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { Supplier, SupplierListProps } from '../types';

// Memoized Supplier Row component to prevent full table re-renders
const SupplierRow = memo(({ supplier, onEdit, onDelete }: { supplier: Supplier, onEdit: (s: Supplier) => void, onDelete: (id: string) => void }) => {
    return (
        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xl overflow-hidden text-slate-500 transition-transform group-hover:scale-110">
                        <User className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{supplier.name}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{supplier.contactName || '-'}</td>
            <td className="px-6 py-4">
                <div className="space-y-1.5">
                    {supplier.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-900/20">
                                <Mail className="w-3 h-3 text-blue-500" />
                            </div>
                            <span>{supplier.email}</span>
                        </div>
                    )}
                    {supplier.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
                                <Phone className="w-3 h-3 text-emerald-500" />
                            </div>
                            <span>{supplier.phone}</span>
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                {supplier.address ? (
                    <div className="flex items-start gap-2 text-xs text-slate-500 max-w-xs group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        <MapPin className="w-3 h-3 text-brand-500 mt-0.5 shrink-0" />
                        <span className="truncate" title={supplier.address}>{supplier.address}</span>
                    </div>
                ) : '-'}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                    <button
                        onClick={() => onEdit(supplier)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all hover:shadow-sm"
                        title="Edit Supplier"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(supplier.id)}
                        className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all hover:shadow-sm"
                        title="Delete Supplier"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
});

SupplierRow.displayName = 'SupplierRow';

const SupplierList = ({
    suppliers,
    loading,
    searchQuery,
    onSearchChange,
    pagination,
    onPageChange,
    onAdd,
    onEdit,
    onDelete,
    isSearchLoading
}: SupplierListProps) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">Suppliers</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        Manage your product suppliers and contact info
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
                >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    Add Supplier
                </button>
            </div>

            <div className="relative group">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isSearchLoading ? 'text-brand-500 animate-pulse scale-110' : 'text-slate-400 group-focus-within:text-brand-500'}`} />
                <input
                    type="text"
                    placeholder="Search by name, contact or email..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-14 pr-6 py-4.5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm text-lg font-medium"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier Entity</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Representative</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact Details</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fulfillment Center</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading && suppliers.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-12 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-2">
                                                <Search className="w-10 h-10 text-slate-300" strokeWidth={1} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No suppliers found</p>
                                                <p className="text-sm text-slate-500 font-medium">Try adjusting your search criteria or add a new supplier to get started.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <SupplierRow 
                                        key={supplier.id} 
                                        supplier={supplier} 
                                        onEdit={onEdit} 
                                        onDelete={onDelete} 
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current View</span>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span className="text-sm font-black text-slate-900 dark:text-white">{pagination.page}</span>
                                <span className="text-slate-300 dark:text-slate-600">/</span>
                                <span className="text-sm font-black text-slate-500 dark:text-slate-400">{pagination.totalPages}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-3 border border-slate-200 dark:border-slate-700 rounded-2xl disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-all hover:border-brand-500 active:scale-90"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-3 border border-slate-200 dark:border-slate-700 rounded-2xl disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-all hover:border-brand-500 active:scale-90"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(SupplierList);
