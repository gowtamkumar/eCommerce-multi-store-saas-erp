'use client';

import { Filter, Search } from 'lucide-react';
import { AttendanceEmployee, AttendanceStatusFilter } from '../../types/attendance';

interface AttendanceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: AttendanceStatusFilter;
  onStatusChange: (value: AttendanceStatusFilter) => void;
  employeeFilter: string;
  onEmployeeChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  employees: AttendanceEmployee[];
  totalLogs: number;
}

export default function AttendanceFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  employeeFilter,
  onEmployeeChange,
  selectedDate,
  onDateChange,
  pageSize,
  onPageSizeChange,
  employees,
  totalLogs,
}: AttendanceFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Search by employee name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Filter className="w-4 h-4" />
          <span>Status</span>
        </label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as AttendanceStatusFilter)}
          className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none transition-all"
        >
          <option value="all">All Sessions</option>
          <option value="active">Active</option>
          <option value="checkedout">Checked Out</option>
          <option value="late">Late</option>
          <option value="on-time">On Time</option>
        </select>
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Employee</span>
        </label>
        <select
          value={employeeFilter}
          onChange={(e) => onEmployeeChange(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none transition-all max-w-[180px]"
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.user?.name || emp.user?.email || emp.id}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Date</span>
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none transition-all"
        />
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Page Size</span>
        </label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none transition-all"
        >
          {[10, 15, 20, 30].map((size) => (
            <option key={size} value={size}>{size} per page</option>
          ))}
        </select>
        <div className="h-12 w-px bg-slate-100 dark:bg-slate-700 mx-2" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
          Total Logs: <span className="text-slate-900 dark:text-white">{totalLogs}</span>
        </p>
      </div>
    </div>
  );
}
