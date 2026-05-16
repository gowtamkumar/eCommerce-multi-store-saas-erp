'use client';

import { clockIn, clockOut, getAttendanceSessions, getEmployees } from '@/services/hrm';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock,
  Download,
  Filter,
  Loader2,
  LogIn,
  LogOut,
  Search,
  User,
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Timer
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AttendanceSession {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut?: string;
  workHours: number;
  overtimeHours: number;
  lateMinutes: number;
  employee?: {
    user?: { name: string; email: string };
    department?: { name: string };
    designation?: { name: string };
  };
}

interface Employee {
  id: string;
  user?: { name: string; email: string };
}

export default function AttendanceManagementPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sessionsRes, empRes] = await Promise.all([
        getAttendanceSessions(),
        getEmployees()
      ]);
      setSessions(sessionsRes || []);
      setEmployees(empRes || []);
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleQuickClockIn = async (employeeId: string) => {
    try {
      setIsProcessing(true);
      await clockIn(employeeId);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Clock-in failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickClockOut = async (employeeId: string) => {
    try {
      setIsProcessing(true);
      await clockOut(employeeId);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Clock-out failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredSessions = sessions.filter(s =>
    !searchQuery || 
    s.employee?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.employee?.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalPresent: new Set(sessions.filter(s => new Date(s.clockIn).toDateString() === new Date().toDateString()).map(s => s.employeeId)).size,
    lateComers: sessions.filter(s => s.lateMinutes > 0 && new Date(s.clockIn).toDateString() === new Date().toDateString()).length,
    activeSessions: sessions.filter(s => !s.clockOut).length
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
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
            onClick={() => setShowManualModal(true)}
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

      {/* Stats Cards */}
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

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by employee name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
          <div className="h-12 w-px bg-slate-100 dark:bg-slate-700 mx-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
            Total Logs: <span className="text-slate-900 dark:text-white">{filteredSessions.length}</span>
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Personnel Info</th>
                <th className="px-8 py-6">Clock In</th>
                <th className="px-8 py-6">Clock Out</th>
                <th className="px-8 py-6">Work Duration</th>
                <th className="px-8 py-6">Punctuality</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Syncing with server...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Calendar className="w-12 h-12 text-slate-300" />
                      <p className="text-sm font-bold text-slate-400 italic uppercase">No activity records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredSessions.map((session, i) => (
                    <motion.tr 
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
                              {session.employee?.user?.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {session.employee?.designation?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <LogIn className="w-3 h-3 text-emerald-500" />
                          <span className="text-sm font-black text-slate-900 dark:text-white italic">
                            {new Date(session.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          {new Date(session.clockIn).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        {session.clockOut ? (
                          <div className="flex items-center gap-2">
                            <LogOut className="w-3 h-3 text-rose-500" />
                            <span className="text-sm font-black text-slate-900 dark:text-white italic">
                              {new Date(session.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg animate-pulse">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-sm font-black text-slate-900 dark:text-white italic">
                            {session.workHours || 0} Hours
                          </span>
                        </div>
                        {session.overtimeHours > 0 && (
                          <p className="text-[10px] font-black text-emerald-500 mt-1 uppercase tracking-widest">
                            +{session.overtimeHours} OT
                          </p>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {session.lateMinutes > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
                              Late: {session.lateMinutes}m
                            </span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                            On Time
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!session.clockOut ? (
                            <button 
                              onClick={() => handleQuickClockOut(session.employeeId)}
                              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
                            >
                              Force Exit
                            </button>
                          ) : (
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulation Control */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 border border-white/10"
        >
          <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-500/40">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Quick Control</p>
            <div className="flex gap-3">
              {employees.length > 0 && (
                <select 
                  value=""
                  className="bg-transparent border-b border-white/20 text-sm font-black italic uppercase tracking-tight outline-none py-1 cursor-pointer"
                  onChange={(e) => {
                    const empId = e.target.value;
                    if (!empId) return;
                    const emp = sessions.find(s => s.employeeId === empId && !s.clockOut);
                    if (emp) handleQuickClockOut(empId);
                    else handleQuickClockIn(empId);
                  }}
                >
                  <option value="" disabled className="text-slate-900 italic">Mark Attendance...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id} className="text-slate-900 font-bold">{e.user?.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowManualModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-8">Manual <span className="text-indigo-600">Entry</span></h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none"
                    onChange={(e) => setSelectedEmp(e.target.value)}
                    value={selectedEmp}
                  >
                    <option value="">Choose Personnel...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
                  </select>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => { handleQuickClockIn(selectedEmp); setShowManualModal(false); }}
                    disabled={!selectedEmp || isProcessing}
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Clock In
                  </button>
                  <button 
                    onClick={() => { handleQuickClockOut(selectedEmp); setShowManualModal(false); }}
                    disabled={!selectedEmp || isProcessing}
                    className="flex-1 py-5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Clock Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
