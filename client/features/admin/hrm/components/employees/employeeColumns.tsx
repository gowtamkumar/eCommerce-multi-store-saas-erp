'use client';

import { Building2, Calendar, Edit2, Eye, MapPin, Trash2, User } from 'lucide-react';
import { DataTableColumn } from '@/components/shared/DataTable';
import { Employee } from '../../types/employee';
import EmployeeStatusBadge from './EmployeeStatusBadge';

interface BuildEmployeeColumnsArgs {
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export function buildEmployeeColumns({
  onEdit,
  onView,
  onDelete,
}: BuildEmployeeColumnsArgs): DataTableColumn<Employee>[] {
  return [
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
      cell: (employee) => <EmployeeStatusBadge status={employee.status} />,
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
  ];
}
