'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { UserRole } from '@/lib/enums/user-role.enum';
import { UserStatus } from '@/lib/enums/user-status.enum';
import { AlertTriangle, Building2, CreditCard, Edit2, History, Plus, Search, Trash2, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import type { CustomerListProps, User } from '../type';

export default function CustomerList({
    users,
    loading,
    pagination,
    onPageChange,
    onDelete,
    onEdit,
    onAdd,
    searchQuery,
    onSearchChange
}: CustomerListProps) {
    const columns = useMemo<DataTableColumn<User>[]>(() => [
        {
            key: 'customer',
            header: 'Customer',
            cell: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform shrink-0">
                        {user.companyName ? <Building2 className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white capitalize">{user.name}</p>
                        {user.companyName ? (
                            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{user.companyName}</p>
                        ) : (
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono tracking-tighter">{user.id.slice(-8).toUpperCase()}</p>
                        )}
                        {user.customerCode && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{user.customerCode}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'contact',
            header: 'Contact',
            cell: (user) => (
                <>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.email}</p>
                    {user.phone && <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-1">{user.phone}</p>}
                </>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (user) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.status === UserStatus.ACTIVE
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                    {user.status}
                </span>
            ),
        },
        {
            key: 'creditLimit',
            header: 'Credit Limit',
            cell: (user) => Number(user.creditLimit) > 0 ? (
                <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                        ${Number(user.creditLimit).toLocaleString()}
                    </span>
                </div>
            ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 italic">No credit</span>
            ),
        },
        {
            key: 'creditHold',
            header: 'Credit Hold',
            cell: (user) => user.creditHold ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    <AlertTriangle className="w-3 h-3" />
                    ON HOLD
                </span>
            ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
            ),
        },
        {
            key: 'joined',
            header: 'Joined',
            className: 'text-slate-500 dark:text-slate-400 text-sm font-medium',
            cell: (user) => new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (user) => (
                <div className="flex justify-end gap-1 items-center">
                    <Link
                        href={`/admin/reports/customer-ledger?customerId=${user.id}`}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-all"
                        title="View Ledger"
                    >
                        <History className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-all"
                        title="Edit Customer"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    {user.role !== UserRole.ADMIN && (
                        <button
                            onClick={() => onDelete(user.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                            title="Delete Customer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        },
    ], [onDelete, onEdit]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Customers</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage B2B & retail customers, credit limits, and account settings
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl transition-all font-semibold shadow-sm hover:translate-y-[-1px] active:translate-y-[0px]"
                >
                    <Plus className="w-5 h-5" />
                    Add Customer
                </button>
            </div>

            {/* Search & Count */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search customers, company, email..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    Total: <span className="text-slate-900 dark:text-white font-bold">{pagination.total}</span> customers
                </div>
            </div>

            <DataTable
                data={users}
                columns={columns}
                getRowKey={(user) => user.id}
                loading={loading}
                loadingLabel="Loading customers..."
                emptyLabel="No customers found matching your criteria."
                containerClassName="relative z-0"
                pagination={{
                    page: pagination.page,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange,
                }}
                paginationSummary={
                    <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                        Showing <span className="font-bold text-slate-900 dark:text-white">{users.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span> customers
                    </div>
                }
            />
        </div>
    );
}
