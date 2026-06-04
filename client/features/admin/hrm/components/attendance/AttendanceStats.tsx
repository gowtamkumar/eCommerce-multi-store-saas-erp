'use client';

import { AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { AttendanceStats as AttendanceStatsData } from '../../types/attendance';

interface AttendanceStatsProps {
  stats: AttendanceStatsData;
}

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Present Today</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalPresent}</h3>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Late Comers</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.lateComers}</h3>
        </div>
      </div>
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full" />
        <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-indigo-400 relative z-10">
          <Timer className="w-8 h-8" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
          <h3 className="text-3xl font-black">{stats.activeSessions}</h3>
        </div>
      </div>
    </div>
  );
}
