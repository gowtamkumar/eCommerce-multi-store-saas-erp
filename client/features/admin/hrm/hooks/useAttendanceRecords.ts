'use client';

import { useCallback, useEffect, useState } from 'react';
import { checkIn, checkOut, getAttendanceEmployees, getAttendanceSessions } from '@/services/hrm';
import type {
  AttendanceEmployee,
  AttendanceLedgerSession,
  AttendanceSourceType,
} from '../types/attendance';

export function useAttendanceRecords() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<AttendanceLedgerSession[]>([]);
  const [employees, setEmployees] = useState<AttendanceEmployee[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sessionsRes, empRes] = await Promise.all([
        getAttendanceSessions(),
        getAttendanceEmployees(),
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

  const handleQuickCheckIn = useCallback(async (employeeId: string, source: AttendanceSourceType = 'WEB') => {
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

  const handleQuickCheckOut = useCallback(async (employeeId: string, source: AttendanceSourceType = 'WEB') => {
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

  return {
    loading,
    sessions,
    employees,
    isProcessing,
    fetchData,
    handleQuickCheckIn,
    handleQuickCheckOut,
  };
}
