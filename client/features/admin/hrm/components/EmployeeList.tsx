'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import React, { useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  MapPin, 
  Building2,
  Calendar,
  Eye
} from 'lucide-react';
import { Employee, EmployeeStatus } from '../type';

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

const StatusBadge = ({ status }: { status: EmployeeStatus }) => {
  const styles: Record<EmployeeStatus, string> = {
    [EmployeeStatus.ACTIVE]: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400',
    [EmployeeStatus.PROBATION]: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    [EmployeeStatus.ON_LEAVE]: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
    [EmployeeStatus.TERMINATED]: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400',
    [EmployeeStatus.SUSPENDED]: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
};

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
  const columns = useMemo<DataTableColumn<Employee>[]>(() => [
    {
      key: 'employee',
      header: 'Employee Info',
      cell: (employee) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-all shadow-sm">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
              {employee.user?.name || 'Unknown'}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">{employee.user?.email}</p>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
              ID: {employee.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role & Dept',
      cell: (employee) => (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              {employee.designation?.name}
            </p>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {employee.department?.name}
          </p>
        </>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (employee) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-rose-500" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">
            {employee.branch?.name || employee.warehouse?.name || 'Remote'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (employee) => <StatusBadge status={employee.status} />,
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      cell: (employee) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Calendar className="w-3 h-3" />
          <span className="text-xs font-bold tracking-tight">
            {new Date(employee.joiningDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (employee) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onView(employee); }}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(employee); }}
            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all"
            title="Edit Record"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(employee.id); }}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [onDelete, onEdit, onView]);

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
