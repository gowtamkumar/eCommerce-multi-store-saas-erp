export enum AttendanceSource {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  BIOMETRIC = 'BIOMETRIC',
  POS = 'POS',
  KIOSK = 'KIOSK',
}

export enum PayrollBatchStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export {
  EmployeeStatus,
  ContractType,
} from './types/employee';
export type {
  Employee,
  EmployeePersonalDetails,
  EmployeeDocument,
} from './types/employee';

export interface AttendanceSession {
  id: string
  employeeId: string
  clockIn: string
  clockOut?: string
  workHours: number
  overtimeHours: number
  lateMinutes: number
  status: string
  note?: string
  source?: AttendanceSource
  deviceId?: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: string
  approvedById?: string
  managerNote?: string
}

export interface PayrollBatch {
  id: string
  name: string
  period: string
  totalAmount: number
  status: PayrollBatchStatus | string
  processedAt?: string
  approvedAt?: string
  paidAt?: string
  approvedById?: string
}

export interface Holiday {
  id: string
  date: string
  name: string
  description?: string
  isOptional: boolean
  year: number
  branchId?: string | null
}

export interface TaxBracket {
  id: string
  fiscalYear: number
  minAmount: number
  maxAmount: number | null
  rate: number
  flatTax: number
  sortOrder: number
}

export interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  graceMinutes: number
  isNightShift: boolean
  workingDays?: number[]
}

export interface JobPosting {
  id: string
  title: string
  status: string
  departmentId: string
  location?: string
}

export interface Applicant {
  id: string
  name: string
  email: string
  status: string
  jobPostingId: string
}

export interface HrmDashboardStats {
  employeeCount: number;
  attendanceCount: number;
  attendanceRate: number;
  leaveCount: number;
  jobCount: number;
  applicantCount: number;
}

export interface HrmDashboardChartItem {
  name: string;
  attendance: number;
}

export interface HrmDashboardProps {
  stats: HrmDashboardStats | null;
  chartData: HrmDashboardChartItem[];
  loading: boolean;
}

