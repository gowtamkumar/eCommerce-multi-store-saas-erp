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

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  PROBATION = 'PROBATION',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  SUSPENDED = 'SUSPENDED',
}

export enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACTUAL = 'CONTRACTUAL',
  INTERN = 'INTERN',
}

export interface Employee {
  id: string
  userId: string
  employeeCode?: string
  branchId?: string
  warehouseId?: string
  departmentId: string
  designationId: string
  status: EmployeeStatus
  contractType: ContractType
  joiningDate: string
  exitDate?: string
  managerId?: string
  manager?: {
    id: string
    user?: {
      name: string
    }
  }
  salaryConfig?: {
    basicSalary: number
    allowances: { type: string; amount: number }[]
    deductions: { type: string; amount: number }[]
  }
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  department?: {
    id: string
    name: string
  }
  designation?: {
    id: string
    name: string
  }
  branch?: {
    id: string
    name: string
  }
  warehouse?: {
    id: string
    name: string
  }
  personalDetails?: EmployeePersonalDetails
  documents?: EmployeeDocument[]
}

export interface EmployeePersonalDetails {
  dob?: string
  gender?: string
  nationalId?: string
  passportNo?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  bloodGroup?: string
  address?: string
}

export interface EmployeeDocument {
  id: string
  documentType: string
  fileUrl: string
  expiryDate?: string
  status: string
}

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

