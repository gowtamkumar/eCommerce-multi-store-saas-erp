'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { checkIn, checkOut, getAttendanceEmployees, getAttendanceSessions } from '@/services/hrm';

dayjs.extend(duration);

export interface AttendanceLedgerSession {
  id: string;
  employeeId: string;
  checkIn: string;
  checkOut?: string;
  workHours: number;
  overtimeHours: number;
  lateMinutes: number;
  source?: 'WEB' | 'MOBILE' | 'BIOMETRIC' | 'POS' | 'KIOSK';
  employee?: {
    user?: { name: string; email: string };
    department?: { name: string };
    designation?: { name: string };
  };
}

export interface Employee {
  id: string;
  user?: { name: string; email: string };
}

export function useAttendanceLedger() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<AttendanceLedgerSession[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'checkedout' | 'late' | 'on-time'>('all');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [manualSource, setManualSource] = useState<'WEB' | 'MOBILE' | 'BIOMETRIC' | 'POS' | 'KIOSK'>('WEB');
  const [now, setNow] = useState(() => dayjs());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sessionsRes, empRes] = await Promise.all([
        getAttendanceSessions(),
        getAttendanceEmployees()
      ]);
      setSessions(sessionsRes || []);
      setEmployees(empRes || []);
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleQuickCheckIn = useCallback(async (employeeId: string, source: 'WEB' | 'MOBILE' | 'BIOMETRIC' | 'POS' | 'KIOSK' = 'WEB') => {
    try {
      setIsProcessing(true);
      await checkIn(employeeId, { source, timezoneOffset: new Date().getTimezoneOffset() });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check-in failed';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  }, [fetchData]);

  const handleQuickCheckOut = useCallback(async (employeeId: string, source: 'WEB' | 'MOBILE' | 'BIOMETRIC' | 'POS' | 'KIOSK' = 'WEB') => {
    try {
      setIsProcessing(true);
      await checkOut(employeeId, { source });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check-out failed';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  }, [fetchData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(dayjs()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, employeeFilter, pageSize, selectedDate]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const checkInDate = new Date(s.checkIn);
      const sessionDate = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}-${String(checkInDate.getDate()).padStart(2, '0')}`;

      const matchesDate = !selectedDate || sessionDate === selectedDate;
      const matchesSearch = !searchQuery ||
        s.employee?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.employee?.user?.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && !s.checkOut) ||
        (statusFilter === 'checkedout' && !!s.checkOut) ||
        (statusFilter === 'late' && s.lateMinutes > 0) ||
        (statusFilter === 'on-time' && s.lateMinutes === 0);

      const matchesEmployee = !employeeFilter || s.employeeId === employeeFilter;
      return matchesSearch && matchesStatus && matchesDate && matchesEmployee;
    });
  }, [sessions, searchQuery, statusFilter, employeeFilter, selectedDate]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  }, [filteredSessions.length, pageSize]);

  const paginatedSessions = useMemo(() => {
    return filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredSessions, currentPage, pageSize]);

  const stats = useMemo(() => {
    const targetDate = selectedDate ? new Date(selectedDate) : new Date();
    const targetDateString = targetDate.toDateString();

    const sessionsForDate = sessions.filter(
      (s) => new Date(s.checkIn).toDateString() === targetDateString,
    );

    return {
      totalPresent: new Set(sessionsForDate.map((s) => s.employeeId)).size,
      lateComers: sessionsForDate.filter((s) => s.lateMinutes > 0).length,
      activeSessions: sessionsForDate.filter((s) => !s.checkOut).length,
    };
  }, [sessions, selectedDate]);

  const formatLateMinutes = useCallback((minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
  }, []);

  const getSessionDuration = useCallback((session: AttendanceLedgerSession) => {
    const start = dayjs(session.checkIn);
    const end = session.checkOut ? dayjs(session.checkOut) : now;
    const diffMs = Math.max(0, end.diff(start));
    const dur = dayjs.duration(diffMs);
    const h = Math.floor(dur.asHours());
    const m = dur.minutes();
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  }, [now]);

  return {
    loading,
    sessions,
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
    now,
    filteredSessions,
    totalPages,
    paginatedSessions,
    stats,
    handleQuickCheckIn,
    handleQuickCheckOut,
    formatLateMinutes,
    getSessionDuration,
    fetchData
  };
}
