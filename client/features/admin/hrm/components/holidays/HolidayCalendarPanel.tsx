'use client';

import dayjs from 'dayjs';
import { Loader2 } from 'lucide-react';
import Calendar from 'react-calendar';
import {
  Holiday,
  HolidayBranch,
  HolidayCalendarView,
} from '../../hooks/useHolidayManager';

interface HolidayCalendarPanelProps {
  loading: boolean;
  branches: HolidayBranch[];
  selectedBranch: string;
  setSelectedBranch: (value: string) => void;
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;
  holidaysByDate: Map<string, Holiday[]>;
  onCreate: (date?: Date) => void;
  onEdit: (holiday: Holiday) => void;
  onPreviousMonth: () => void;
  onToday: () => void;
  onNextMonth: () => void;
}

export default function HolidayCalendarPanel({
  loading,
  branches,
  selectedBranch,
  setSelectedBranch,
  calendarDate,
  setCalendarDate,
  holidaysByDate,
  onCreate,
  onEdit,
  onPreviousMonth,
  onToday,
  onNextMonth,
}: HolidayCalendarPanelProps) {
  return (
    <div className="xl:col-span-9 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600">
            {dayjs(calendarDate).format('MMMM YYYY')}
          </div>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
        </div>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
        >
          <option value="">All Branches + Global</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={onPreviousMonth}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all"
            >
              Prev
            </button>
            <button
              onClick={onToday}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
            >
              Today
            </button>
            <button
              onClick={onNextMonth}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all"
            >
              Next
            </button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Click any date to add a holiday
          </p>
        </div>

        <div className="hrm-react-calendar rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <Calendar
            calendarType="gregory"
            value={calendarDate}
            activeStartDate={dayjs(calendarDate).startOf('month').toDate()}
            onActiveStartDateChange={({ activeStartDate }: { activeStartDate: Date | null }) => {
              if (activeStartDate) setCalendarDate(activeStartDate);
            }}
            onClickDay={(value: Date) => onCreate(value)}
            next2Label={null}
            prev2Label={null}
            tileClassName={({ date, view }: { date: Date; view: HolidayCalendarView }) => {
              if (view !== 'month') return '';
              const classes = ['hrm-calendar-tile'];
              if (dayjs(date).isSame(dayjs(), 'day')) classes.push('is-today');
              if (!dayjs(date).isSame(calendarDate, 'month')) classes.push('is-muted');
              if ((holidaysByDate.get(dayjs(date).format('YYYY-MM-DD')) || []).length > 0) {
                classes.push('has-holiday');
              }
              return classes.join(' ');
            }}
            tileContent={({ date, view }: { date: Date; view: HolidayCalendarView }) => {
              if (view !== 'month') return null;
              const dayHolidays = holidaysByDate.get(dayjs(date).format('YYYY-MM-DD')) || [];
              if (dayHolidays.length === 0) return null;

              return (
                <div className="mt-2 space-y-1.5">
                  {dayHolidays.slice(0, 3).map((holiday) => (
                    <span
                      key={holiday.id}
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(holiday);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          onEdit(holiday);
                        }
                      }}
                      className={`block truncate rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-sm ${holiday.isOptional ? 'bg-amber-500' : 'bg-indigo-600'}`}
                      title={holiday.description || holiday.name}
                    >
                      {holiday.name}
                    </span>
                  ))}
                  {dayHolidays.length > 3 && (
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">
                      +{dayHolidays.length - 3} more
                    </span>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        .hrm-react-calendar .react-calendar {
          width: 100%;
          border: 0;
          background: transparent;
          font-family: inherit;
        }

        .hrm-react-calendar .react-calendar__navigation {
          display: none;
        }

        .hrm-react-calendar .react-calendar__month-view__weekdays {
          background: rgb(248 250 252);
          border-bottom: 1px solid rgb(241 245 249);
        }

        .dark .hrm-react-calendar .react-calendar__month-view__weekdays {
          background: rgb(15 23 42);
          border-bottom-color: rgb(51 65 85);
        }

        .hrm-react-calendar .react-calendar__month-view__weekdays__weekday {
          padding: 1rem;
          color: rgb(148 163 184);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-align: center;
        }

        .hrm-react-calendar .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }

        .hrm-react-calendar .react-calendar__tile {
          min-height: 8rem;
          padding: 0.75rem;
          text-align: left;
          background: white;
          border-right: 1px solid rgb(241 245 249);
          border-bottom: 1px solid rgb(241 245 249);
          color: rgb(71 85 105);
          transition: background 150ms ease, color 150ms ease;
        }

        .dark .hrm-react-calendar .react-calendar__tile {
          background: rgb(30 41 59);
          border-color: rgb(51 65 85);
          color: rgb(203 213 225);
        }

        .hrm-react-calendar .react-calendar__tile:hover,
        .hrm-react-calendar .react-calendar__tile:focus {
          background: rgb(238 242 255);
        }

        .dark .hrm-react-calendar .react-calendar__tile:hover,
        .dark .hrm-react-calendar .react-calendar__tile:focus {
          background: rgba(79, 70, 229, 0.18);
        }

        .hrm-react-calendar .react-calendar__tile abbr {
          display: inline-flex;
          width: 2rem;
          height: 2rem;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          font-size: 0.75rem;
          font-weight: 900;
        }

        .hrm-react-calendar .react-calendar__tile.is-muted {
          opacity: 0.55;
        }

        .hrm-react-calendar .react-calendar__tile.is-today abbr {
          background: rgb(79 70 229);
          color: white;
        }

        .hrm-react-calendar .react-calendar__tile.has-holiday {
          background: rgb(248 250 252);
        }

        .dark .hrm-react-calendar .react-calendar__tile.has-holiday {
          background: rgba(15, 23, 42, 0.58);
        }

        .hrm-react-calendar .react-calendar__tile--active {
          background: rgb(238 242 255);
          color: rgb(79 70 229);
        }
      `}</style>
    </div>
  );
}
