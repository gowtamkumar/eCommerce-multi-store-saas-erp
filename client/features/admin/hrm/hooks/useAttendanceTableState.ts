'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  AttendanceLedgerSession,
  AttendanceStatusFilter,
} from '../types/attendance';
import {
  filterAttendanceSessions,
  getAttendanceStats,
  getDateInputValue,
} from './attendanceUtils';

interface UseAttendanceTableStateArgs {
  sessions: AttendanceLedgerSession[];
}

export function useAttendanceTableState({ sessions }: UseAttendanceTableStateArgs) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatusFilter>('all');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => getDateInputValue(new Date()));
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, employeeFilter, pageSize, selectedDate]);

  const filteredSessions = useMemo(() => {
    return filterAttendanceSessions({
      sessions,
      searchQuery,
      statusFilter,
      employeeFilter,
      selectedDate,
    });
  }, [employeeFilter, searchQuery, selectedDate, sessions, statusFilter]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  }, [filteredSessions.length, pageSize]);

  const paginatedSessions = useMemo(() => {
    return filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [currentPage, filteredSessions, pageSize]);

  const stats = useMemo(() => {
    return getAttendanceStats(sessions, selectedDate);
  }, [sessions, selectedDate]);

  return {
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
    filteredSessions,
    totalPages,
    paginatedSessions,
    stats,
  };
}
