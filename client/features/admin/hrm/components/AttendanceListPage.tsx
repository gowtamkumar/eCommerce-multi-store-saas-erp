'use client';

import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Loader2,
  LogIn,
  LogOut,
  Search,
  Timer,
  User
} from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { useAttendanceLedger, AttendanceLedgerSession } from '../hooks/useAttendanceLedger';

export default function AttendanceListPage() {
  const {
    loading,
    employees,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    employeeFilter,
    setEmployeeFilter,
    selectedDate,
    setSelectedDate,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    isProcessing,
    showManualModal,
    setShowManualModal,
    selectedEmp,
    setSelectedEmp,
    manualSource,
    setManualSource,
    filteredSessions,
    totalPages,
    paginatedSessions,
    stats,
    handleQuickCheckIn,
    handleQuickCheckOut,
    formatLateMinutes,
    getSessionDuration,
  } = useAttendanceLedger();

  const columns = useMemo<DataTableColumn<AttendanceLedgerSession>[]>(() => [
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
              onClick={() => handleQuickCheckOut(session.employeeId)}
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
  ], [handleQuickCheckOut, formatLateMinutes, getSessionDuration, isProcessing]);

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
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Status</span>
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none transition-all"
          >
            <option value="all">All Sessions</option>
            <option value="active">Active</option>
            <option value="checkedout">Checked Out</option>
            <option value="late">Late</option>
            <option value="on-time">On Time</option>
          </select>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Employee</span>
          </label>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none transition-all max-w-[180px]"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.user?.name || emp.user?.email || emp.id}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Date</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none transition-all"
          />
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Page Size</span>
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none transition-all"
          >
            {[10, 15, 20, 30].map((size) => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
          <div className="h-12 w-px bg-slate-100 dark:bg-slate-700 mx-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
            Total Logs: <span className="text-slate-900 dark:text-white">{filteredSessions.length}</span>
          </p>
        </div>
      </div>

      {/* Table Section */}
      <DataTable
        data={paginatedSessions}
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
          total: filteredSessions.length,
          totalPages: totalPages,
          onPageChange: (page) => setCurrentPage(page)
        }}
        paginationSummary={
          <div className="text-sm font-black text-slate-500 dark:text-slate-400">
            Showing <span className="text-slate-900 dark:text-white">{filteredSessions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>
            {' '}to{' '}
            <span className="text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredSessions.length)}</span>
            {' '}of{' '}
            <span className="text-slate-900 dark:text-white">{filteredSessions.length}</span> logs
          </div>
        }
      />

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowManualModal(false)} className="absolute inset-0" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10 border border-slate-150 dark:border-slate-700 overflow-hidden">
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
                    {employees.map(e => <option key={e.id} value={e.id}>{e.user?.name || e.user?.email || e.id}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['WEB', 'MOBILE', 'BIOMETRIC', 'POS', 'KIOSK'] as const).map((src) => (
                      <button
                        type="button"
                        key={src}
                        onClick={() => setManualSource(src)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${manualSource === src
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-indigo-600'
                          }`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => { void handleQuickCheckIn(selectedEmp, manualSource); setShowManualModal(false); }}
                    disabled={!selectedEmp || isProcessing}
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Check In
                  </button>
                  <button
                    onClick={() => { void handleQuickCheckOut(selectedEmp, manualSource); setShowManualModal(false); }}
                    disabled={!selectedEmp || isProcessing}
                    className="flex-1 py-5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Check Out
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
