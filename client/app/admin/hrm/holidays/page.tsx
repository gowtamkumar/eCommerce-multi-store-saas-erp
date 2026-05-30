'use client';

import { createHoliday, deleteHoliday, getHolidays, updateHoliday } from '@/services/hrm';
import { getBranches } from '@/services/organization';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, Globe2, Loader2, MapPin, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';

interface Holiday {
  id: string;
  date: string;
  name: string;
  description?: string;
  isOptional: boolean;
  branchId?: string | null;
  branch?: { name: string };
}

interface Branch {
  id: string;
  name: string;
}

interface HolidayForm {
  date: string;
  name: string;
  description: string;
  branchId: string;
  isOptional: boolean;
}

type CalendarView = 'month' | 'year' | 'decade' | 'century';

const getErrorMessage = (error: unknown, fallback: string) => (
  error instanceof Error ? error.message : fallback
);

const defaultForm = (): HolidayForm => ({
  date: new Date().toISOString().split('T')[0],
  name: '',
  description: '',
  branchId: '',
  isOptional: false,
});

export default function HolidaysPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState<HolidayForm>(defaultForm);

  const currentYear = calendarDate.getFullYear();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [holidayRes, branchRes] = await Promise.all([
        getHolidays({ year: currentYear, branchId: selectedBranch || undefined }),
        getBranches(),
      ]);
      setHolidays((holidayRes || []) as Holiday[]);
      setBranches(branchRes?.data || []);
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    } finally {
      setLoading(false);
    }
  }, [currentYear, selectedBranch]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const holidaysByDate = useMemo(() => {
    const map = new Map<string, Holiday[]>();
    for (const holiday of holidays) {
      const key = dayjs(holiday.date).format('YYYY-MM-DD');
      map.set(key, [...(map.get(key) || []), holiday]);
    }
    return map;
  }, [holidays]);

  const openCreateForm = (date?: Date) => {
    setEditingHoliday(null);
    setFormData({
      ...defaultForm(),
      date: dayjs(date || calendarDate).format('YYYY-MM-DD'),
      branchId: selectedBranch,
    });
    setShowForm(true);
  };

  const openEditForm = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      date: dayjs(holiday.date).format('YYYY-MM-DD'),
      name: holiday.name,
      description: holiday.description || '',
      branchId: holiday.branchId || '',
      isOptional: holiday.isOptional,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.date) return;

    const payload = {
      date: formData.date,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      branchId: formData.branchId || null,
      isOptional: formData.isOptional,
    };

    try {
      setSubmitting(true);
      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, payload);
      } else {
        await createHoliday(payload);
      }
      setShowForm(false);
      setEditingHoliday(null);
      await fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to save holiday'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (holiday: Holiday) => {
    if (!confirm(`Delete "${holiday.name}"?`)) return;
    try {
      await deleteHoliday(holiday.id);
      await fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete holiday'));
    }
  };

  const upcomingHolidays = useMemo(() => {
    const now = dayjs().startOf('day');
    return [...holidays]
      .filter((holiday) => dayjs(holiday.date).isSame(now) || dayjs(holiday.date).isAfter(now))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
      .slice(0, 6);
  }, [holidays]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Holiday <span className="text-indigo-600">Calendar</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Global and branch-specific holidays used by payroll attendance rules
          </p>
        </div>
        <button
          onClick={() => openCreateForm()}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Add Holiday
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Year Holidays</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{holidays.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <Globe2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{holidays.filter((h) => !h.branchId).length}</h3>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center gap-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full" />
          <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-indigo-400 relative z-10">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Branch Specific</p>
            <h3 className="text-3xl font-black">{holidays.filter((h) => h.branchId).length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
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
                  onClick={() => setCalendarDate(dayjs(calendarDate).subtract(1, 'month').toDate())}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCalendarDate(new Date())}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                >
                  Today
                </button>
                <button
                  onClick={() => setCalendarDate(dayjs(calendarDate).add(1, 'month').toDate())}
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
                onClickDay={(value: Date) => openCreateForm(value)}
                next2Label={null}
                prev2Label={null}
                tileClassName={({ date, view }: { date: Date; view: CalendarView }) => {
                  if (view !== 'month') return '';
                  const classes = ['hrm-calendar-tile'];
                  if (dayjs(date).isSame(dayjs(), 'day')) classes.push('is-today');
                  if (!dayjs(date).isSame(calendarDate, 'month')) classes.push('is-muted');
                  if ((holidaysByDate.get(dayjs(date).format('YYYY-MM-DD')) || []).length > 0) {
                    classes.push('has-holiday');
                  }
                  return classes.join(' ');
                }}
                tileContent={({ date, view }: { date: Date; view: CalendarView }) => {
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
                            openEditForm(holiday);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              event.stopPropagation();
                              openEditForm(holiday);
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
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <CalendarIcon className="w-10 h-10 text-indigo-400 mb-6 relative z-10" />
            <h4 className="text-2xl font-black italic uppercase tracking-tight leading-none mb-2 relative z-10">Upcoming <br />Holidays</h4>
            <div className="mt-8 space-y-3 relative z-10">
              {upcomingHolidays.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 italic">No upcoming holidays configured.</p>
              ) : upcomingHolidays.map((holiday) => (
                <button
                  key={holiday.id}
                  onClick={() => openEditForm(holiday)}
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
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8">
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic">
                {editingHoliday ? 'Edit' : 'Add'} <span className="text-indigo-600">Holiday</span>
              </h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Holiday Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Eid Holiday"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Scope</label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                    >
                      <option value="">Global holiday</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none h-24 resize-none"
                    placeholder="Optional notes for HR and payroll reviewers..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOptional: !formData.isOptional })}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700"
                >
                  <span>
                    <span className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Optional Holiday</span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Informational only, not a mandatory closure</span>
                  </span>
                  <span className={`w-12 h-6 rounded-full transition-all relative ${formData.isOptional ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isOptional ? 'right-1' : 'left-1'}`} />
                  </span>
                </button>

                <div className="flex gap-3 pt-2">
                  {editingHoliday && (
                    <button
                      onClick={() => handleDelete(editingHoliday)}
                      className="px-5 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !formData.name.trim() || !formData.date}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Save Holiday
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
