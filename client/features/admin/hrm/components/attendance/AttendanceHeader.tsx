'use client';

import { Download, LogIn } from 'lucide-react';

interface AttendanceHeaderProps {
  onMarkAttendance: () => void;
}

export default function AttendanceHeader({ onMarkAttendance }: AttendanceHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
          Attendance <span className="text-indigo-600">Ledger</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
          Real-time tracking of personnel activity and punctuality
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onMarkAttendance}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
        >
          <LogIn className="w-4 h-4" />
          Mark Attendance
        </button>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>
    </div>
  );
}
