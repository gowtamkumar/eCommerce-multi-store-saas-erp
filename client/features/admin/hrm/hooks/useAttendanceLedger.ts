'use client';

import { formatLateMinutes } from './attendanceUtils';
import { useAttendanceDuration } from './useAttendanceDuration';
import { useAttendanceRecords } from './useAttendanceRecords';
import { useAttendanceTableState } from './useAttendanceTableState';
import { useManualAttendanceEntry } from './useManualAttendanceEntry';

export type { AttendanceLedgerSession, AttendanceEmployee } from '../types/attendance';

export function useAttendanceLedger() {
  const records = useAttendanceRecords();
  const table = useAttendanceTableState({ sessions: records.sessions });
  const duration = useAttendanceDuration();
  const manualEntry = useManualAttendanceEntry({
    onCheckIn: records.handleQuickCheckIn,
    onCheckOut: records.handleQuickCheckOut,
  });

  return {
    ...records,
    ...table,
    ...duration,
    ...manualEntry,
    formatLateMinutes,
  };
}
