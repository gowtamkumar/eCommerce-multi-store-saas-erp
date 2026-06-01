'use client';

import { assignShift, createShift, deleteShift, getEmployees, getShifts, updateShift } from '@/services/hrm';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock,
  Edit2,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  User,
  X,
  History,
  CheckCircle2
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  isNightShift: boolean;
  workingDays?: number[];
}

interface Employee {
  id: string;
  user?: { name: string; email: string };
  department?: { name: string };
  designation?: { name: string };
}

export default function ShiftManagementPage() {
  const [, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);

  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [shiftData, setShiftData] = useState({
    name: '',
    startTime: '09:00:00',
    endTime: '18:00:00',
    graceMinutes: 15,
    isNightShift: false,
    workingDays: [1, 2, 3, 4, 5] as number[],
  });

  const [assignData, setAssignData] = useState({
    employeeId: '',
    shiftId: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    const strHour = String(hour).padStart(2, '0');
    return `${strHour}:${minute} ${ampm}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [shiftRes, empRes] = await Promise.all([getShifts(), getEmployees()]);
      setShifts(shiftRes || []);
      setEmployees(empRes || []);
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(fetchData); }, [fetchData]);

  const handleShiftSubmit = async () => {
    if (!shiftData.name.trim()) return;
    try {
      setSubmitting(true);
      if (editingId) {
        await updateShift(editingId, shiftData);
      } else {
        await createShift(shiftData);
      }
      setShowShiftForm(false);
      setEditingId(null);
      setShiftData({ name: '', startTime: '09:00:00', endTime: '18:00:00', graceMinutes: 15, isNightShift: false, workingDays: [1, 2, 3, 4, 5] });
      fetchData();
    } catch (err) {
      console.error('Failed to save shift:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!assignData.employeeId || !assignData.shiftId) return;
    try {
      setSubmitting(true);
      await assignShift(assignData.employeeId, {
        shiftId: assignData.shiftId,
        effectiveFrom: assignData.effectiveFrom
      });
      setShowAssignForm(false);
      setAssignData({ employeeId: '', shiftId: '', effectiveFrom: new Date().toISOString().split('T')[0] });
      alert('Shift assigned successfully!');
    } catch (err) {
      console.error('Failed to assign shift:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm('Delete this shift template?')) return;
    try {
      await deleteShift(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete shift:', err);
    }
  };

  const filteredShifts = shifts.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Shift <span className="text-indigo-600">Architecture</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Define work schedules and employee assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAssignForm(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <User className="w-4 h-4 text-indigo-600" />
            Assign Shift
          </button>
          <button
            onClick={() => { setEditingId(null); setShiftData({ name: '', startTime: '09:00:00', endTime: '18:00:00', graceMinutes: 15, isNightShift: false, workingDays: [1, 2, 3, 4, 5] }); setShowShiftForm(true); }}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shift Templates */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search shift templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredShifts.map((shift) => (
                <motion.div
                  key={shift.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white dark:bg-slate-800 p-6 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all relative overflow-hidden"
                >
                  {/* Decorative background icon */}
                  <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 dark:text-slate-700/30 group-hover:text-indigo-50 dark:group-hover:text-indigo-900/10 transition-colors" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                        <Clock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingId(shift.id); setShiftData({ ...shift, workingDays: shift.workingDays?.length ? shift.workingDays : [1, 2, 3, 4, 5] }); setShowShiftForm(true); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
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
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${shift.workingDays!.includes(idx)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                              }`}
                          >
                            {d.charAt(0)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Quick Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <History className="w-10 h-10 text-indigo-400 mb-6" />
              <h4 className="text-2xl font-black italic uppercase tracking-tight leading-none mb-2">Shift <br />Efficiency</h4>
              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">Automate your workforce rotation and track punctuality metrics.</p>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Templates</span>
                  <span className="text-lg font-black">{shifts.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Night Operations</span>
                  <span className="text-lg font-black text-indigo-400">{shifts.filter(s => s.isNightShift).length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50">
            <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Assignment Tip</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic">
              &ldquo;Assigning a shift with an effective date in the future will automatically queue it in the employee&apos;s timeline.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Shift Template Modal */}
      <AnimatePresence>
        {showShiftForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShiftForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <button onClick={() => setShowShiftForm(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic">
                {editingId ? 'Modify' : 'Create'} <span className="text-indigo-600">Shift</span>
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Template Name</label>
                  <input
                    type="text"
                    value={shiftData.name}
                    onChange={(e) => setShiftData({ ...shiftData, name: e.target.value })}
                    placeholder="e.g. Standard Day Shift"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                    <input
                      type="time"
                      step="1"
                      value={shiftData.startTime}
                      onChange={(e) => setShiftData({ ...shiftData, startTime: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                    <input
                      type="time"
                      step="1"
                      value={shiftData.endTime}
                      onChange={(e) => setShiftData({ ...shiftData, endTime: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Night Shift</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Crosses midnight boundary</p>
                  </div>
                  <button
                    onClick={() => setShiftData({ ...shiftData, isNightShift: !shiftData.isNightShift })}
                    className={`w-12 h-6 rounded-full transition-all relative ${shiftData.isNightShift ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${shiftData.isNightShift ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    value={shiftData.graceMinutes}
                    onChange={(e) => setShiftData({ ...shiftData, graceMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working Days</label>
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { idx: 0, label: 'Sun' },
                      { idx: 1, label: 'Mon' },
                      { idx: 2, label: 'Tue' },
                      { idx: 3, label: 'Wed' },
                      { idx: 4, label: 'Thu' },
                      { idx: 5, label: 'Fri' },
                      { idx: 6, label: 'Sat' },
                    ].map((d) => {
                      const active = (shiftData.workingDays || []).includes(d.idx);
                      return (
                        <button
                          type="button"
                          key={d.idx}
                          onClick={() => {
                            const current = shiftData.workingDays || [];
                            const next = active
                              ? current.filter((x) => x !== d.idx)
                              : [...current, d.idx].sort((a, b) => a - b);
                            setShiftData({ ...shiftData, workingDays: next });
                          }}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-indigo-600'
                            }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Days marked off are treated as scheduled rest (not absences) by payroll.
                  </p>
                </div>

                <button
                  onClick={handleShiftSubmit}
                  disabled={submitting || !shiftData.name.trim()}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Finalize Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shift Assignment Modal */}
      <AnimatePresence>
        {showAssignForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssignForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <button onClick={() => setShowAssignForm(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic">
                Assign <span className="text-indigo-600">Personnel</span>
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
                  <select
                    value={assignData.employeeId}
                    onChange={(e) => setAssignData({ ...assignData, employeeId: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.user?.name} ({emp.designation?.name})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Shift Template</label>
                  <select
                    value={assignData.shiftId}
                    onChange={(e) => setAssignData({ ...assignData, shiftId: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none"
                  >
                    <option value="">Select Template...</option>
                     {shifts.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({formatTime12h(s.startTime)} - {formatTime12h(s.endTime)})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Effective From</label>
                  <input
                    type="date"
                    value={assignData.effectiveFrom}
                    onChange={(e) => setAssignData({ ...assignData, effectiveFrom: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>

                <button
                  onClick={handleAssignSubmit}
                  disabled={submitting || !assignData.employeeId || !assignData.shiftId}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Assign Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}