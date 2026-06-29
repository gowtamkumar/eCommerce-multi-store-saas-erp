import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import {
  ApplicantStatus,
  AttendanceSource,
  ContractType,
  EmployeeStatus,
  JobStatus,
  LeaveStatus,
  LeaveType,
} from '@/common/enums/hrm/hrm-enums'
import { PaginationDto } from '@/common/dto/pagination.dto'

export class CreateDepartmentDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  description?: string
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  description?: string
}

export class CreateDesignationDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  grade?: string

  @IsString()
  @IsOptional()
  salaryBand?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  departmentId: string
}

export class UpdateDesignationDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  grade?: string

  @IsString()
  @IsOptional()
  salaryBand?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  departmentId?: string
}

class AllowanceDeductionItemDto {
  @IsString()
  type: string

  @IsNumber()
  @Min(0)
  amount: number
}

export class SalaryConfigDto {
  @IsNumber()
  @Min(0)
  basicSalary: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceDeductionItemDto)
  @IsOptional()
  allowances?: AllowanceDeductionItemDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceDeductionItemDto)
  @IsOptional()
  deductions?: AllowanceDeductionItemDto[]

  @IsNumber()
  @IsOptional()
  @Min(0)
  standardMonthlyHours?: number

  @IsNumber()
  @IsOptional()
  @Min(0)
  overtimeMultiplier?: number

  @IsNumber()
  @IsOptional()
  @Min(0)
  lateDeductionMultiplier?: number
}

class EmergencyContactDto {
  @IsString()
  name: string

  @IsString()
  relationship: string

  @IsString()
  phone: string
}

export class CreateEmployeePersonalDetailsDto {
  @IsDateString()
  @IsOptional()
  dob?: string

  @IsString()
  @IsOptional()
  gender?: string

  @IsString()
  @IsOptional()
  nationalId?: string

  @IsString()
  @IsOptional()
  passportNo?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto

  @IsString()
  @IsOptional()
  bloodGroup?: string

  @IsString()
  @IsOptional()
  address?: string
}

export class CreateEmployeeDocumentDto {
  @IsString()
  documentType: string

  @IsString()
  fileUrl: string

  @IsOptional()
  @IsString()
  id?: string

  @IsDateString()
  @IsOptional()
  expiryDate?: string
}

export class CreateEmployeeDto {
  @IsString()
  userId: string

  @IsString()
  @IsOptional()
  branchId?: string

  @IsString()
  @IsOptional()
  warehouseId?: string

  @IsString()
  departmentId: string

  @IsString()
  @IsOptional()
  designationId?: string

  @IsString()
  @IsOptional()
  managerId?: string

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus

  @IsEnum(ContractType)
  @IsOptional()
  contractType?: ContractType

  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryConfigDto)
  salaryConfig?: SalaryConfigDto

  @IsDateString()
  joiningDate: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeePersonalDetailsDto)
  personalDetails?: CreateEmployeePersonalDetailsDto

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeDocumentDto)
  documents?: CreateEmployeeDocumentDto[]
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  branchId?: string

  @IsString()
  @IsOptional()
  departmentId?: string

  @IsString()
  @IsOptional()
  designationId?: string

  @IsString()
  @IsOptional()
  managerId?: string

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus

  @IsEnum(ContractType)
  @IsOptional()
  contractType?: ContractType

  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryConfigDto)
  salaryConfig?: SalaryConfigDto

  @IsDateString()
  @IsOptional()
  exitDate?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeePersonalDetailsDto)
  personalDetails?: CreateEmployeePersonalDetailsDto

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeDocumentDto)
  documents?: CreateEmployeeDocumentDto[]
}

export class CreateShiftDto {
  @IsString()
  name: string

  @IsString()
  startTime: string

  @IsString()
  endTime: string

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(120)
  graceMinutes?: number

  @IsBoolean()
  @IsOptional()
  isNightShift?: boolean

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  workingDays?: number[]
}

export class UpdateShiftDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  startTime?: string

  @IsString()
  @IsOptional()
  endTime?: string

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(120)
  graceMinutes?: number

  @IsBoolean()
  @IsOptional()
  isNightShift?: boolean

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  workingDays?: number[]
}

export class AssignShiftDto {
  @IsString()
  shiftId: string

  @IsDateString()
  effectiveFrom: string

  @IsDateString()
  @IsOptional()
  effectiveTo?: string
}

export class RequestLeaveDto {
  @IsEnum(LeaveType)
  leaveType: LeaveType

  @IsDateString()
  startDate: string

  @IsDateString()
  endDate: string

  @IsString()
  reason: string
}

export class ApproveLeaveDto {
  @IsString()
  approvedById: string

  @IsString()
  @IsOptional()
  managerNote?: string
}

export class RejectLeaveDto {
  @IsString()
  rejectedById: string

  @IsString()
  @IsOptional()
  managerNote?: string
}

export class CheckInDto {
  @IsString()
  @IsOptional()
  ip?: string

  @IsEnum(AttendanceSource)
  @IsOptional()
  source?: AttendanceSource

  @IsString()
  @IsOptional()
  deviceId?: string

  @IsNumber()
  @IsOptional()
  gpsLat?: number

  @IsNumber()
  @IsOptional()
  gpsLong?: number

  @IsString()
  @IsOptional()
  photoUrl?: string

  @IsNumber()
  @IsOptional()
  timezoneOffset?: number
}

export class ProcessPayrollDto {
  @IsString()
  period: string

  @IsString()
  name: string
}

export class ApprovePayrollBatchDto {
  @IsString()
  approvedById: string
}

export class CreateHolidayDto {
  @IsDateString()
  date: string

  @IsString()
  name: string

  @IsBoolean()
  @IsOptional()
  isOptional?: boolean

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  branchId?: string
}

export class UpdateHolidayDto {
  @IsDateString()
  @IsOptional()
  date?: string

  @IsString()
  @IsOptional()
  name?: string

  @IsBoolean()
  @IsOptional()
  isOptional?: boolean

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  branchId?: string
}

export class CreateJobPostingDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[]

  @IsString()
  departmentId: string

  @IsString()
  @IsOptional()
  location?: string

  @IsNumber()
  @IsOptional()
  @Min(0)
  salaryRangeMin?: number

  @IsNumber()
  @IsOptional()
  @Min(0)
  salaryRangeMax?: number

  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus
}

export class CreateApplicantDto {
  @IsString()
  @IsOptional()
  firstName?: string

  @IsString()
  @IsOptional()
  lastName?: string

  @IsString()
  email: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  resumeUrl?: string

  @IsString()
  jobPostingId: string

  @IsString()
  @IsOptional()
  source?: string
}

export class ScheduleInterviewDto {
  @IsString()
  applicantId: string

  @IsString()
  interviewerId: string

  @IsDateString()
  scheduledAt: string

  @IsString()
  @IsOptional()
  notes?: string

  @IsString()
  @IsOptional()
  status?: string
}

export class UpdateApplicantStatusDto {
  @IsEnum(ApplicantStatus)
  status: ApplicantStatus
}

export class CreatePerformanceReviewDto {
  @IsString()
  employeeId: string

  @IsString()
  reviewerId: string

  @IsString()
  reviewPeriod: string

  @IsNumber()
  @Min(0)
  @Max(5)
  score: number

  @IsString()
  @IsOptional()
  comments?: string

  @IsArray()
  @IsOptional()
  kpi_metrics?: { metric_name: string; target: number; achieved: number; score: number }[]
}

export class CreateTaxBracketDto {
  @IsInt()
  @Min(2000)
  fiscalYear: number

  @IsNumber()
  @Min(0)
  minAmount: number

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxAmount?: number

  @IsNumber()
  @Min(0)
  @Max(1)
  rate: number

  @IsNumber()
  @IsOptional()
  @Min(0)
  flatTax?: number

  @IsInt()
  @IsOptional()
  sortOrder?: number
}

export class TaxBracketDto extends CreateTaxBracketDto {}

export class AddEmployeeDocumentDto {
  @IsString()
  documentType: string

  @IsString()
  fileUrl: string

  @IsDateString()
  @IsOptional()
  expiryDate?: string
}

// Leave statuses for filtering
export class LeaveQueryDto extends PaginationDto {
  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus

  @IsString()
  @IsOptional()
  employeeId?: string

  @IsDateString()
  @IsOptional()
  from?: string

  @IsDateString()
  @IsOptional()
  to?: string
}

export class EmployeeQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  departmentId?: string

  @IsString()
  @IsOptional()
  branchId?: string

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus
}

export class AttendanceQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  employeeId?: string

  @IsString()
  @IsOptional()
  branchId?: string

  @IsDateString()
  @IsOptional()
  from?: string

  @IsDateString()
  @IsOptional()
  to?: string
}
