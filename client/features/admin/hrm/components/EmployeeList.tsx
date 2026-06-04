'use client';

import DataTable from '@/components/shared/DataTable';
import React, { useMemo } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { Employee } from '../types/employee';
import { buildEmployeeColumns } from './employees/employeeColumns';

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function EmployeeList({
  employees,
  loading,
  onAdd,
  onEdit,
  onView,
  onDelete,
  searchQuery,
  onSearchChange
}: EmployeeListProps) {
  const columns = useMemo(
    () => buildEmployeeColumns({ onDelete, onEdit, onView }),
    [onDelete, onEdit, onView],
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-8 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
            Employee <span className="text-indigo-600">Directory</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
            Managing {employees.length} active staff profiles
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Add New Employee
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-[400px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
            Export <span className="text-slate-900 dark:text-white ml-2">CSV</span>
          </div>
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
            Filter <span className="text-indigo-600 ml-2">All Status</span>
          </div>
        </div>
      </div>

      <DataTable
        data={employees}
        columns={columns}
        getRowKey={(employee) => employee.id}
        loading={loading}
        loadingLabel="Processing records..."
        emptyLabel={
          <div className="flex flex-col items-center gap-2">
            <User className="w-12 h-12 text-slate-200 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-400 italic">No matching personnel records found.</p>
          </div>
        }
        containerClassName="rounded-[2.5rem] shadow-xl relative"
        minWidthClassName="min-w-[1000px]"
        rowClassName="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all"
        onRowClick={onView}
      />
    </div>
  );
}
