'use client';

import { Calendar } from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { AttendanceLedgerSession } from '../../types/attendance';

interface AttendanceLogTableProps {
  sessions: AttendanceLedgerSession[];
  columns: DataTableColumn<AttendanceLedgerSession>[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalLogs: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AttendanceLogTable({
  sessions,
  columns,
  loading,
  currentPage,
  pageSize,
  totalLogs,
  totalPages,
  onPageChange,
}: AttendanceLogTableProps) {
  return (
    <DataTable
      data={sessions}
      columns={columns}
      getRowKey={(session) => session.id}
      loading={loading}
      loadingLabel="Syncing with server..."
      emptyLabel={
        <div className="flex flex-col items-center gap-2 opacity-40">
          <Calendar className="w-12 h-12 text-slate-300" />
          <p className="text-sm font-bold text-slate-400 italic uppercase">No activity records found</p>
        </div>
      }
      containerClassName="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
      minWidthClassName="min-w-[1000px]"
      pagination={{
        page: currentPage,
        total: totalLogs,
        totalPages,
        onPageChange,
      }}
      paginationSummary={
        <div className="text-sm font-black text-slate-500 dark:text-slate-400">
          Showing <span className="text-slate-900 dark:text-white">{totalLogs === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>
          {' '}to{' '}
          <span className="text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, totalLogs)}</span>
          {' '}of{' '}
          <span className="text-slate-900 dark:text-white">{totalLogs}</span> logs
        </div>
      }
    />
  );
}
