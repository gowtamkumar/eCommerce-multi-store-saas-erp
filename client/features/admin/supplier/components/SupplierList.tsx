'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { Edit, History, Mail, MapPin, Phone, Plus, Search, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { memo, useMemo } from 'react';
import { Supplier, SupplierListProps } from '../types';

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
    const columns = useMemo<DataTableColumn<Supplier>[]>(() => [
        {
            key: 'supplier',
            header: 'Supplier Entity',
            cell: (supplier) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xl overflow-hidden text-slate-500 transition-transform group-hover:scale-110">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{supplier.name}</span>
                        <div className="flex gap-2 mt-1 flex-wrap items-center">
                            {supplier.code && (
                                <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {supplier.code}
                                </span>
                            )}
                            <span className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {supplier.category?.name || 'OTHER'}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${supplier.isActive !== false ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'}`}>
                                {supplier.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'representative',
            header: 'Representative',
            className: 'text-sm text-slate-600 dark:text-slate-400 font-medium',
            cell: (supplier) => (
                <div>
                    <span className="block font-semibold text-slate-900 dark:text-white">{supplier.contactName || '-'}</span>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-bold uppercase">
                        <span>⭐ {supplier.rating !== undefined ? Number(supplier.rating).toFixed(1) : '5.0'}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>⏱️ {supplier.leadTimeDays || 0} Days</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'contact',
            header: 'Contact Details',
            cell: (supplier) => (
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
            ),
        },
        {
            key: 'address',
            header: 'Fulfillment Center',
            cell: (supplier) => supplier.address ? (
                <div className="flex items-start gap-2 text-xs text-slate-500 max-w-xs group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    <MapPin className="w-3 h-3 text-brand-500 mt-0.5 shrink-0" />
                    <span className="truncate" title={supplier.address}>{supplier.address}</span>
                </div>
            ) : '-',
        },
        {
            key: 'accounting',
            header: 'Accounting',
            cell: (supplier) => supplier.outstandingBalance && Number(supplier.outstandingBalance) !== 0 ? (
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Outstanding</span>
                    <span className={`text-sm font-black ${supplier.outstandingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(supplier.outstandingBalance)}
                    </span>
                </div>
            ) : (
                <span className="text-slate-400 dark:text-slate-600 text-xs font-semibold">-</span>
            ),
        },
        {
            key: 'actions',
            header: 'Operations',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (supplier) => (
                <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                    <Link
                        href={`/admin/reports/supplier-ledger?supplierId=${supplier.id}`}
                        className="p-2.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-xl transition-all hover:shadow-sm"
                        title="View Ledger"
                    >
                        <History className="w-4 h-4" />
                    </Link>
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
            ),
        },
    ], [onDelete, onEdit]);

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

            <DataTable
                data={suppliers}
                columns={columns}
                getRowKey={(supplier) => supplier.id}
                loading={loading && suppliers.length === 0}
                loadingLabel="Loading suppliers..."
                emptyLabel={
                    <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-2">
                            <Search className="w-10 h-10 text-slate-300" strokeWidth={1} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No suppliers found</p>
                            <p className="text-sm text-slate-500 font-medium">Try adjusting your search criteria or add a new supplier to get started.</p>
                        </div>
                    </div>
                }
                containerClassName="rounded-[2.5rem] transition-all hover:shadow-md"
                pagination={{
                    page: pagination.page,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange,
                }}
                paginationSummary={
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current View</span>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                            <span className="text-sm font-black text-slate-900 dark:text-white">{pagination.page}</span>
                            <span className="text-slate-300 dark:text-slate-600">/</span>
                            <span className="text-sm font-black text-slate-500 dark:text-slate-400">{pagination.totalPages}</span>
                        </div>
                    </div>
                }
            />
        </div>
    );
};

export default memo(SupplierList);
