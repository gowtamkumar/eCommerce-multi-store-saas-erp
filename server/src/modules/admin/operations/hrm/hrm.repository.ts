import { ApplicantStatus } from '@/common/enums/hrm/hrm-enums'
import { Injectable } from '@nestjs/common'
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm'
import { AttendanceEventEntity } from './entities/attendance-event.entity'
import { AttendanceSessionEntity } from './entities/attendance.entity'
import { DepartmentEntity } from './entities/department.entity'
import { DesignationEntity } from './entities/designation.entity'
import { EmployeeDocumentEntity } from './entities/employee-document.entity'
import { EmployeeIdSequenceEntity } from './entities/employee-id-sequence.entity'
import { EmployeePersonalDetailsEntity } from './entities/employee-personal-details.entity'
import { EmployeeEntity } from './entities/employee.entity'
import { HolidayEntity } from './entities/holiday.entity'
import { LeaveQuotaEntity, LeaveRequestEntity } from './entities/leave.entity'
import { PayrollBatchEntity, PayrollSlipEntity } from './entities/payroll.entity'
import { PerformanceReviewEntity } from './entities/performance.entity'
import { ApplicantEntity, InterviewEntity, JobPostingEntity } from './entities/recruitment.entity'
import { EmployeeShiftAssignmentEntity, ShiftEntity } from './entities/shift.entity'
import { TaxBracketEntity } from './entities/tax-bracket.entity'
import { HrmAttendanceRepository } from './repositories/hrm-attendance.repository'
import { HrmEmployeeRepository } from './repositories/hrm-employee.repository'
import { HrmLeaveRepository } from './repositories/hrm-leave.repository'
import { HrmOrganizationRepository } from './repositories/hrm-organization.repository'
import { HrmPayrollRepository } from './repositories/hrm-payroll.repository'
import { HrmPerformanceRepository } from './repositories/hrm-performance.repository'
import { HrmRecruitmentRepository } from './repositories/hrm-recruitment.repository'

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

/**
 * Thin facade over the HRM domain repositories. Keeps the original public
 * surface (methods + entity repository accessors) intact so services depending
 * on `HrmRepository` continue to work unchanged.
 */
@Injectable()
export class HrmRepository {
  constructor(
    private readonly organizationRepository: HrmOrganizationRepository,
    private readonly employeeRepository: HrmEmployeeRepository,
    private readonly attendanceRepository: HrmAttendanceRepository,
    private readonly leaveRepository: HrmLeaveRepository,
    private readonly payrollRepository: HrmPayrollRepository,
    private readonly recruitmentRepository: HrmRecruitmentRepository,
    private readonly performanceRepository: HrmPerformanceRepository,
  ) {}

  // --- Exposed entity repositories (preserved public surface) ---
  get employeeRepo(): Repository<EmployeeEntity> {
    return this.employeeRepository.employeeRepo
  }

  get personalDetailsRepo(): Repository<EmployeePersonalDetailsEntity> {
    return this.employeeRepository.personalDetailsRepo
  }

  get documentRepo(): Repository<EmployeeDocumentEntity> {
    return this.employeeRepository.documentRepo
  }

  get holidayRepo(): Repository<HolidayEntity> {
    return this.employeeRepository.holidayRepo
  }

  get taxBracketRepo(): Repository<TaxBracketEntity> {
    return this.employeeRepository.taxBracketRepo
  }

  get employeeIdSeqRepo(): Repository<EmployeeIdSequenceEntity> {
    return this.employeeRepository.employeeIdSeqRepo
  }

  get leaveRequestRepo(): Repository<LeaveRequestEntity> {
    return this.leaveRepository.leaveRequestRepo
  }

  get leaveQuotaRepo(): Repository<LeaveQuotaEntity> {
    return this.leaveRepository.leaveQuotaRepo
  }

  get payrollBatchRepo(): Repository<PayrollBatchEntity> {
    return this.payrollRepository.payrollBatchRepo
  }

  get applicantRepo(): Repository<ApplicantEntity> {
    return this.recruitmentRepository.applicantRepo
  }

  // --- Department ---
  async createDepartment(data: Partial<DepartmentEntity>): Promise<DepartmentEntity> {
    return this.organizationRepository.createDepartment(data)
  }

  async findAllDepartments(tenantId: string): Promise<DepartmentEntity[]> {
    return this.organizationRepository.findAllDepartments(tenantId)
  }

  async findDepartmentById(id: string, tenantId: string): Promise<DepartmentEntity | null> {
    return this.organizationRepository.findDepartmentById(id, tenantId)
  }

  async updateDepartment(id: string, data: Partial<DepartmentEntity>): Promise<void> {
    return this.organizationRepository.updateDepartment(id, data)
  }

  async deleteDepartment(id: string): Promise<void> {
    return this.organizationRepository.deleteDepartment(id)
  }

  // --- Designation ---
  async createDesignation(data: Partial<DesignationEntity>): Promise<DesignationEntity> {
    return this.organizationRepository.createDesignation(data)
  }

  async findAllDesignations(tenantId: string): Promise<DesignationEntity[]> {
    return this.organizationRepository.findAllDesignations(tenantId)
  }

  async findDesignationById(id: string, tenantId: string): Promise<DesignationEntity | null> {
    return this.organizationRepository.findDesignationById(id, tenantId)
  }

  async updateDesignation(id: string, data: Partial<DesignationEntity>): Promise<void> {
    return this.organizationRepository.updateDesignation(id, data)
  }

  async deleteDesignation(id: string): Promise<void> {
    return this.organizationRepository.deleteDesignation(id)
  }

  // --- Employee ---
  async createEmployee(data: Partial<EmployeeEntity>): Promise<EmployeeEntity> {
    return this.employeeRepository.createEmployee(data)
  }

  async findAllEmployees(
    tenantId: string,
    branchId?: string,
    options?: {
      page?: number
      limit?: number
      departmentId?: string
      status?: string
      q?: string
    },
  ): Promise<PaginatedResult<EmployeeEntity>> {
    return this.employeeRepository.findAllEmployees(tenantId, branchId, options)
  }

  async findEmployeesAll(tenantId: string, branchId?: string): Promise<EmployeeEntity[]> {
    return this.employeeRepository.findEmployeesAll(tenantId, branchId)
  }

  async findEmployeeById(id: string, tenantId: string): Promise<EmployeeEntity | null> {
    return this.employeeRepository.findEmployeeById(id, tenantId)
  }

  async updateEmployee(id: string, data: Partial<EmployeeEntity>): Promise<void> {
    return this.employeeRepository.updateEmployee(id, data)
  }

  // --- Shifts ---
  async createShift(data: Partial<ShiftEntity>): Promise<ShiftEntity> {
    return this.attendanceRepository.createShift(data)
  }

  async findAllShifts(tenantId: string): Promise<ShiftEntity[]> {
    return this.attendanceRepository.findAllShifts(tenantId)
  }

  async findShiftById(id: string, tenantId: string): Promise<ShiftEntity | null> {
    return this.attendanceRepository.findShiftById(id, tenantId)
  }

  async updateShift(id: string, data: Partial<ShiftEntity>): Promise<void> {
    return this.attendanceRepository.updateShift(id, data)
  }

  async deleteShift(id: string): Promise<void> {
    return this.attendanceRepository.deleteShift(id)
  }

  async assignShift(
    data: Partial<EmployeeShiftAssignmentEntity>,
  ): Promise<EmployeeShiftAssignmentEntity> {
    return this.attendanceRepository.assignShift(data)
  }

  async findEmployeeShiftAssignments(
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeShiftAssignmentEntity[]> {
    return this.attendanceRepository.findEmployeeShiftAssignments(employeeId, tenantId)
  }

  async findEmployeeShift(
    employeeId: string,
    date: Date,
    tenantId: string,
  ): Promise<EmployeeShiftAssignmentEntity | null> {
    return this.attendanceRepository.findEmployeeShift(employeeId, date, tenantId)
  }

  async findEmployeeShiftsForEmployees(
    employeeIds: string[],
    date: Date,
    tenantId: string,
  ): Promise<EmployeeShiftAssignmentEntity[]> {
    return this.attendanceRepository.findEmployeeShiftsForEmployees(employeeIds, date, tenantId)
  }

  // --- Attendance ---
  async logAttendanceEvent(data: Partial<AttendanceEventEntity>): Promise<AttendanceEventEntity> {
    return this.attendanceRepository.logAttendanceEvent(data)
  }

  async saveAttendanceSession(
    data: Partial<AttendanceSessionEntity>,
  ): Promise<AttendanceSessionEntity> {
    return this.attendanceRepository.saveAttendanceSession(data)
  }

  async findLatestAttendanceSession(
    employeeId: string,
    tenantId: string,
  ): Promise<AttendanceSessionEntity | null> {
    return this.attendanceRepository.findLatestAttendanceSession(employeeId, tenantId)
  }

  async findAllAttendanceSessions(
    tenantId: string,
    branchId?: string,
    options?: {
      page?: number
      limit?: number
      employeeId?: string
      from?: Date
      to?: Date
    },
  ): Promise<PaginatedResult<AttendanceSessionEntity>> {
    return this.attendanceRepository.findAllAttendanceSessions(tenantId, branchId, options)
  }

  async findAttendanceSessionsForEmployee(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<AttendanceSessionEntity[]> {
    return this.attendanceRepository.findAttendanceSessionsForEmployee(
      employeeId,
      startDate,
      endDate,
      tenantId,
    )
  }

  async findAttendanceSessionsForEmployees(
    employeeIds: string[],
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<AttendanceSessionEntity[]> {
    return this.attendanceRepository.findAttendanceSessionsForEmployees(
      employeeIds,
      startDate,
      endDate,
      tenantId,
    )
  }

  // --- Leaves ---
  async createLeaveRequest(data: Partial<LeaveRequestEntity>): Promise<LeaveRequestEntity> {
    return this.leaveRepository.createLeaveRequest(data)
  }

  async updateLeaveRequest(id: string, data: Partial<LeaveRequestEntity>): Promise<void> {
    return this.leaveRepository.updateLeaveRequest(id, data)
  }

  async findLeaveRequestById(id: string, tenantId: string): Promise<LeaveRequestEntity | null> {
    return this.leaveRepository.findLeaveRequestById(id, tenantId)
  }

  async findAllLeaveRequests(
    tenantId: string,
    options?: {
      page?: number
      limit?: number
      employeeId?: string
      status?: string
      from?: Date
      to?: Date
    },
  ): Promise<PaginatedResult<LeaveRequestEntity>> {
    return this.leaveRepository.findAllLeaveRequests(tenantId, options)
  }

  async findOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    tenantId: string,
    excludeId?: string,
  ): Promise<LeaveRequestEntity[]> {
    return this.leaveRepository.findOverlappingLeaves(
      employeeId,
      startDate,
      endDate,
      tenantId,
      excludeId,
    )
  }

  async findLeaveQuota(
    employeeId: string,
    year: number,
    tenantId: string,
  ): Promise<LeaveQuotaEntity[]> {
    return this.leaveRepository.findLeaveQuota(employeeId, year, tenantId)
  }

  // --- Payroll ---
  async findActivePayrollBatchForPeriod(
    tenantId: string,
    period: string,
  ): Promise<PayrollBatchEntity | null> {
    return this.payrollRepository.findActivePayrollBatchForPeriod(tenantId, period)
  }

  async findAllPayrollBatches(tenantId: string): Promise<PayrollBatchEntity[]> {
    return this.payrollRepository.findAllPayrollBatches(tenantId)
  }

  async findPayrollBatchById(id: string, tenantId: string): Promise<PayrollBatchEntity | null> {
    return this.payrollRepository.findPayrollBatchById(id, tenantId)
  }

  async updatePayrollBatch(id: string, data: Partial<PayrollBatchEntity>): Promise<void> {
    return this.payrollRepository.updatePayrollBatch(id, data)
  }

  async findPayrollSlipsByBatch(batchId: string, tenantId: string): Promise<PayrollSlipEntity[]> {
    return this.payrollRepository.findPayrollSlipsByBatch(batchId, tenantId)
  }

  // --- Recruitment ---
  async createJobPosting(data: Partial<JobPostingEntity>): Promise<JobPostingEntity> {
    return this.recruitmentRepository.createJobPosting(data)
  }

  async findAllJobPostings(tenantId: string): Promise<JobPostingEntity[]> {
    return this.recruitmentRepository.findAllJobPostings(tenantId)
  }

  async createApplicant(data: Partial<ApplicantEntity>): Promise<ApplicantEntity> {
    return this.recruitmentRepository.createApplicant(data)
  }

  async findAllApplicants(tenantId: string): Promise<ApplicantEntity[]> {
    return this.recruitmentRepository.findAllApplicants(tenantId)
  }

  async findApplicantById(id: string, tenantId: string): Promise<ApplicantEntity | null> {
    return this.recruitmentRepository.findApplicantById(id, tenantId)
  }

  async updateApplicantStatus(id: string, status: ApplicantStatus): Promise<void> {
    return this.recruitmentRepository.updateApplicantStatus(id, status)
  }

  async scheduleInterview(data: Partial<InterviewEntity>): Promise<InterviewEntity> {
    return this.recruitmentRepository.scheduleInterview(data)
  }

  async findInterviewsByApplicant(
    applicantId: string,
    tenantId: string,
  ): Promise<InterviewEntity[]> {
    return this.recruitmentRepository.findInterviewsByApplicant(applicantId, tenantId)
  }

  // --- Performance ---
  async createPerformanceReview(
    data: Partial<PerformanceReviewEntity>,
  ): Promise<PerformanceReviewEntity> {
    return this.performanceRepository.createPerformanceReview(data)
  }

  async findAllPerformanceReviews(tenantId: string): Promise<PerformanceReviewEntity[]> {
    return this.performanceRepository.findAllPerformanceReviews(tenantId)
  }

  async findEmployeeReviews(
    employeeId: string,
    tenantId: string,
  ): Promise<PerformanceReviewEntity[]> {
    return this.performanceRepository.findEmployeeReviews(employeeId, tenantId)
  }

  // --- Holidays ---
  async findHolidaysInRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<HolidayEntity[]> {
    return this.employeeRepository.findHolidaysInRange(tenantId, startDate, endDate, branchId)
  }

  async findHolidaysExpiringSoon(referenceDate: Date): Promise<EmployeeDocumentEntity[]> {
    return this.employeeRepository.findHolidaysExpiringSoon(referenceDate)
  }

  async findExpiringDocuments(daysAhead: number): Promise<EmployeeDocumentEntity[]> {
    return this.employeeRepository.findExpiringDocuments(daysAhead)
  }

  // --- Probation auto-confirmation ---
  async findEmployeesEligibleForProbationCompletion(
    referenceDate: Date,
    probationDays: number,
  ): Promise<EmployeeEntity[]> {
    return this.employeeRepository.findEmployeesEligibleForProbationCompletion(
      referenceDate,
      probationDays,
    )
  }

  // --- Employee ID sequence ---
  async nextEmployeeId(tenantId: string): Promise<string> {
    return this.employeeRepository.nextEmployeeId(tenantId)
  }

  async getStats(tenantId: string, branchId?: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const employeeWhere: FindOptionsWhere<EmployeeEntity> = { tenantId }
    const attendanceWhere: FindOptionsWhere<AttendanceSessionEntity> = {
      tenantId,
      checkIn: MoreThanOrEqual(today) as any,
    }
    const jobWhere: FindOptionsWhere<JobPostingEntity> = { tenantId, status: 'PUBLISHED' as any }
    const applicantWhere: FindOptionsWhere<ApplicantEntity> = { tenantId }
    const leaveWhere: FindOptionsWhere<LeaveRequestEntity> = { tenantId, status: 'PENDING' as any }

    if (branchId) {
      employeeWhere.branchId = branchId
      attendanceWhere.branchId = branchId
    }

    const [employeeCount, jobCount, applicantCount, attendanceCount, leaveCount] =
      await Promise.all([
        this.employeeRepository.countEmployees(employeeWhere),
        this.recruitmentRepository.countJobPostings(jobWhere),
        this.recruitmentRepository.countApplicants(applicantWhere),
        this.attendanceRepository.countAttendanceSessions(attendanceWhere),
        this.leaveRepository.countLeaveRequests(leaveWhere),
      ])

    return {
      employeeCount,
      jobCount,
      applicantCount,
      attendanceCount,
      attendanceRate: employeeCount > 0 ? (attendanceCount / employeeCount) * 100 : 0,
      leaveCount,
    }
  }
}
