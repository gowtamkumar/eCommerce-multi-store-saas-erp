export type AttendanceSourceType = 'WEB' | 'MOBILE' | 'BIOMETRIC' | 'POS' | 'KIOSK';

export const ATTENDANCE_SOURCES: AttendanceSourceType[] = ['WEB', 'MOBILE', 'BIOMETRIC', 'POS', 'KIOSK'];

export type AttendanceStatusFilter = 'all' | 'active' | 'checkedout' | 'late' | 'on-time';

export interface AttendanceLedgerSession {
  id: string;
  employeeId: string;
  checkIn: string;
  checkOut?: string;
  workHours: number;
  overtimeHours: number;
  lateMinutes: number;
  source?: AttendanceSourceType;
  employee?: {
    user?: { name: string; email: string };
    department?: { name: string };
    designation?: { name: string };
  };
}

export interface AttendanceEmployee {
  id: string;
  user?: { name: string; email: string };
}

export interface AttendanceStats {
  totalPresent: number;
  lateComers: number;
  activeSessions: number;
}
