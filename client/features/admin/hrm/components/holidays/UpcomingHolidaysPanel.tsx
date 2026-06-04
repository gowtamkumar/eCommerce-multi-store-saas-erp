'use client';

import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Holiday } from '../../hooks/useHolidayManager';

interface UpcomingHolidaysPanelProps {
  holidays: Holiday[];
  onEdit: (holiday: Holiday) => void;
}

export default function UpcomingHolidaysPanel({ holidays, onEdit }: UpcomingHolidaysPanelProps) {
  return (
    <div className="xl:col-span-3 space-y-6">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <CalendarIcon className="w-10 h-10 text-indigo-400 mb-6 relative z-10" />
        <h4 className="text-2xl font-black italic uppercase tracking-tight leading-none mb-2 relative z-10">Upcoming <br />Holidays</h4>
        <div className="mt-8 space-y-3 relative z-10">
          {holidays.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 italic">No upcoming holidays configured.</p>
          ) : holidays.map((holiday) => (
            <button
              key={holiday.id}
              onClick={() => onEdit(holiday)}
              className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
            >
              <p className="text-sm font-black uppercase tracking-tight">{holiday.name}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mt-1">
                {dayjs(holiday.date).format('MMM D, YYYY')}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
