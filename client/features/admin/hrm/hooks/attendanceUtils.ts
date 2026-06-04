import {
  AttendanceLedgerSession,
  AttendanceStatusFilter,
} from '../types/attendance';

export function getDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatLateMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
}

interface FilterAttendanceSessionsArgs {
  sessions: AttendanceLedgerSession[];
  searchQuery: string;
  statusFilter: AttendanceStatusFilter;
  employeeFilter: string;
  selectedDate: string;
}

export function filterAttendanceSessions({
  sessions,
  searchQuery,
  statusFilter,
  employeeFilter,
  selectedDate,
}: FilterAttendanceSessionsArgs) {
  const query = searchQuery.toLowerCase();

  return sessions.filter((session) => {
    const sessionDate = getDateInputValue(new Date(session.checkIn));
    const matchesDate = !selectedDate || sessionDate === selectedDate;
    const matchesSearch = !query ||
      session.employee?.user?.name.toLowerCase().includes(query) ||
      session.employee?.user?.email.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !session.checkOut) ||
      (statusFilter === 'checkedout' && !!session.checkOut) ||
      (statusFilter === 'late' && session.lateMinutes > 0) ||
      (statusFilter === 'on-time' && session.lateMinutes === 0);

    const matchesEmployee = !employeeFilter || session.employeeId === employeeFilter;
    return matchesSearch && matchesStatus && matchesDate && matchesEmployee;
  });
}

export function getAttendanceStats(sessions: AttendanceLedgerSession[], selectedDate: string) {
  const targetDateString = new Date(selectedDate || getDateInputValue(new Date())).toDateString();
  const sessionsForDate = sessions.filter(
    (session) => new Date(session.checkIn).toDateString() === targetDateString,
  );

  return {
    totalPresent: new Set(sessionsForDate.map((session) => session.employeeId)).size,
    lateComers: sessionsForDate.filter((session) => session.lateMinutes > 0).length,
    activeSessions: sessionsForDate.filter((session) => !session.checkOut).length,
  };
}
