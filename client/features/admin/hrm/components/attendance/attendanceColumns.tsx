'use client';

import { Clock, LogIn, LogOut, User } from 'lucide-react';
import { DataTableColumn } from '@/components/shared/DataTable';
import { AttendanceLedgerSession } from '../../types/attendance';

interface BuildAttendanceColumnsArgs {
  isProcessing: boolean;
  onForceExit: (employeeId: string) => void;
  formatLateMinutes: (minutes: number) => string;
  getSessionDuration: (session: AttendanceLedgerSession) => string;
}

export function buildAttendanceColumns({
  isProcessing,
  onForceExit,
  formatLateMinutes,
  getSessionDuration,
}: BuildAttendanceColumnsArgs): DataTableColumn<AttendanceLedgerSession>[] {
  return [
    {
      key: 'employee',
      header: 'Personnel Info',
      cell: (session) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
              {session.employee?.user?.name || 'Unknown'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {session.employee?.designation?.name || 'Staff'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'checkIn',
      header: 'Check In',
      cell: (session) => (
        <>
          <div className="flex items-center gap-2">
            <LogIn className="w-3 h-3 text-emerald-500" />
            <span className="text-sm font-black text-slate-900 dark:text-white italic">
              {new Date(session.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {new Date(session.checkIn).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </>
      ),
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      cell: (session) => session.checkOut ? (
        <div className="flex items-center gap-2">
          <LogOut className="w-3 h-3 text-rose-500" />
          <span className="text-sm font-black text-slate-900 dark:text-white italic">
            {new Date(session.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      ) : (
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg animate-pulse">
          Active
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Work Duration',
      cell: (session) => (
        <>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-sm font-black text-slate-900 dark:text-white italic">
              {getSessionDuration(session)}
            </span>
          </div>
          {session.overtimeHours > 0 && (
            <p className="text-[10px] font-black text-emerald-500 mt-1 uppercase tracking-widest">
              +{session.overtimeHours} OT
            </p>
          )}
        </>
      ),
    },
    {
      key: 'punctuality',
      header: 'Punctuality',
      cell: (session) => session.lateMinutes > 0 ? (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
            Late: {formatLateMinutes(session.lateMinutes)}
          </span>
        </div>
      ) : (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
          On Time
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      cell: (session) => (
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg">
          {session.source || 'WEB'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (session) => (
        <div className="flex justify-end gap-2">
          {!session.checkOut ? (
            <button
              onClick={() => onForceExit(session.employeeId)}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
              disabled={isProcessing}
            >
              Force Exit
            </button>
          ) : (
            <span className="px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
              Completed
            </span>
          )}
        </div>
      ),
    },
  ];
}
