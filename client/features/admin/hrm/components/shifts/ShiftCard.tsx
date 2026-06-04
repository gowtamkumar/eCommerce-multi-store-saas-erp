'use client';

import { motion } from 'framer-motion';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { Shift, formatTime12h } from '../../hooks/useShiftManager';
import { DAYS } from './shiftDays';

interface ShiftCardProps {
  shift: Shift;
  onEdit: (shift: Shift) => void;
  onDelete: (id: string) => void;
}

export default function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white dark:bg-slate-800 p-6 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all relative overflow-hidden"
    >
      <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 dark:text-slate-700/30 group-hover:text-indigo-50 dark:group-hover:text-indigo-900/10 transition-colors" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(shift)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(shift.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-1">{shift.name}</h3>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Start</p>
            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{formatTime12h(shift.startTime)}</p>
          </div>
          <div className="h-8 w-px bg-slate-100 dark:bg-slate-700 mx-2" />
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">End</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">{formatTime12h(shift.endTime)}</p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${shift.isNightShift ? 'bg-indigo-900 text-indigo-200' : 'bg-amber-100 text-amber-700'}`}>
              {shift.isNightShift ? 'Night' : 'Day'}
            </span>
          </div>
        </div>
        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Grace Period: <span className="text-slate-900 dark:text-white">{shift.graceMinutes} mins</span>
        </p>
        {shift.workingDays && shift.workingDays.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {DAYS.map(({ idx, label }) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${shift.workingDays!.includes(idx) ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
              >
                {label.charAt(0)}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
