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

  async findAllDepartments(storeId: string): Promise<DepartmentEntity[]> {
    return this.organizationRepository.findAllDepartments(storeId)
  }

  async findDepartmentById(id: string, storeId: string): Promise<DepartmentEntity | null> {
    return this.organizationRepository.findDepartmentById(id, storeId)
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

  async findAllDesignations(storeId: string): Promise<DesignationEntity[]> {
    return this.organizationRepository.findAllDesignations(storeId)
  }

  async findDesignationById(id: string, storeId: string): Promise<DesignationEntity | null> {
    return this.organizationRepository.findDesignationById(id, storeId)
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
    storeId: string,
    branchId?: string,
    options?: {
      page?: number
      limit?: number
      departmentId?: string
      status?: string
      q?: string
    },
  ): Promise<PaginatedResult<EmployeeEntity>> {
    return this.employeeRepository.findAllEmployees(storeId, branchId, options)
  }

  async findEmployeesAll(storeId: string, branchId?: string): Promise<EmployeeEntity[]> {
    return this.employeeRepository.findEmployeesAll(storeId, branchId)
  }

  async findEmployeeById(id: string, storeId: string): Promise<EmployeeEntity | null> {
    return this.employeeRepository.findEmployeeById(id, storeId)
  }

  async updateEmployee(id: string, data: Partial<EmployeeEntity>): Promise<void> {
    return this.employeeRepository.updateEmployee(id, data)
  }

  // --- Shifts ---
  async createShift(data: Partial<ShiftEntity>): Promise<ShiftEntity> {
    return this.attendanceRepository.createShift(data)
  }

  async findAllShifts(storeId: string): Promise<ShiftEntity[]> {
    return this.attendanceRepository.findAllShifts(storeId)
  }

  async findShiftById(id: string, storeId: string): Promise<ShiftEntity | null> {
    return this.attendanceRepository.findShiftById(id, storeId)
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
    storeId: string,
  ): Promise<EmployeeShiftAssignmentEntity[]> {
    return this.attendanceRepository.findEmployeeShiftAssignments(employeeId, storeId)
  }

  async findEmployeeShift(
    employeeId: string,
    date: Date,
    storeId: string,
  ): Promise<EmployeeShiftAssignmentEntity | null> {
    return this.attendanceRepository.findEmployeeShift(employeeId, date, storeId)
  }

  async findEmployeeShiftsForEmployees(
    employeeIds: string[],
    date: Date,
    storeId: string,
  ): Promise<EmployeeShiftAssignmentEntity[]> {
    return this.attendanceRepository.findEmployeeShiftsForEmployees(employeeIds, date, storeId)
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
    storeId: string,
  ): Promise<AttendanceSessionEntity | null> {
    return this.attendanceRepository.findLatestAttendanceSession(employeeId, storeId)
  }

  async findAllAttendanceSessions(
    storeId: string,
    branchId?: string,
    options?: {
      page?: number
      limit?: number
      employeeId?: string
      from?: Date
      to?: Date
    },
  ): Promise<PaginatedResult<AttendanceSessionEntity>> {
    return this.attendanceRepository.findAllAttendanceSessions(storeId, branchId, options)
  }

  async findAttendanceSessionsForEmployee(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    storeId: string,
  ): Promise<AttendanceSessionEntity[]> {
    return this.attendanceRepository.findAttendanceSessionsForEmployee(
      employeeId,
      startDate,
      endDate,
      storeId,
    )
  }

  async findAttendanceSessionsForEmployees(
    employeeIds: string[],
    startDate: Date,
    endDate: Date,
    storeId: string,
  ): Promise<AttendanceSessionEntity[]> {
    return this.attendanceRepository.findAttendanceSessionsForEmployees(
      employeeIds,
      startDate,
      endDate,
      storeId,
    )
  }

  // --- Leaves ---
  async createLeaveRequest(data: Partial<LeaveRequestEntity>): Promise<LeaveRequestEntity> {
    return this.leaveRepository.createLeaveRequest(data)
  }

  async updateLeaveRequest(id: string, data: Partial<LeaveRequestEntity>): Promise<void> {
    return this.leaveRepository.updateLeaveRequest(id, data)
  }

  async findLeaveRequestById(id: string, storeId: string): Promise<LeaveRequestEntity | null> {
    return this.leaveRepository.findLeaveRequestById(id, storeId)
  }

  async findAllLeaveRequests(
    storeId: string,
    options?: {
      page?: number
      limit?: number
      employeeId?: string
      status?: string
      from?: Date
      to?: Date
    },
  ): Promise<PaginatedResult<LeaveRequestEntity>> {
    return this.leaveRepository.findAllLeaveRequests(storeId, options)
  }

  async findOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    storeId: string,
    excludeId?: string,
  ): Promise<LeaveRequestEntity[]> {
    return this.leaveRepository.findOverlappingLeaves(
      employeeId,
      startDate,
      endDate,
      storeId,
      excludeId,
    )
  }

  async findLeaveQuota(
    employeeId: string,
    year: number,
    storeId: string,
  ): Promise<LeaveQuotaEntity[]> {
    return this.leaveRepository.findLeaveQuota(employeeId, year, storeId)
  }

  // --- Payroll ---
  async findActivePayrollBatchForPeriod(
    storeId: string,
    period: string,
  ): Promise<PayrollBatchEntity | null> {
    return this.payrollRepository.findActivePayrollBatchForPeriod(storeId, period)
  }

  async findAllPayrollBatches(storeId: string): Promise<PayrollBatchEntity[]> {
    return this.payrollRepository.findAllPayrollBatches(storeId)
  }

  async findPayrollBatchById(id: string, storeId: string): Promise<PayrollBatchEntity | null> {
    return this.payrollRepository.findPayrollBatchById(id, storeId)
  }

  async updatePayrollBatch(id: string, data: Partial<PayrollBatchEntity>): Promise<void> {
    return this.payrollRepository.updatePayrollBatch(id, data)
  }

  async findPayrollSlipsByBatch(batchId: string, storeId: string): Promise<PayrollSlipEntity[]> {
    return this.payrollRepository.findPayrollSlipsByBatch(batchId, storeId)
  }

  // --- Recruitment ---
  async createJobPosting(data: Partial<JobPostingEntity>): Promise<JobPostingEntity> {
    return this.recruitmentRepository.createJobPosting(data)
  }

  async findAllJobPostings(storeId: string): Promise<JobPostingEntity[]> {
    return this.recruitmentRepository.findAllJobPostings(storeId)
  }

  async createApplicant(data: Partial<ApplicantEntity>): Promise<ApplicantEntity> {
    return this.recruitmentRepository.createApplicant(data)
  }

  async findAllApplicants(storeId: string): Promise<ApplicantEntity[]> {
    return this.recruitmentRepository.findAllApplicants(storeId)
  }

  async findApplicantById(id: string, storeId: string): Promise<ApplicantEntity | null> {
    return this.recruitmentRepository.findApplicantById(id, storeId)
  }

  async updateApplicantStatus(id: string, status: ApplicantStatus): Promise<void> {
    return this.recruitmentRepository.updateApplicantStatus(id, status)
  }

  async scheduleInterview(data: Partial<InterviewEntity>): Promise<InterviewEntity> {
    return this.recruitmentRepository.scheduleInterview(data)
  }

  async findInterviewsByApplicant(
    applicantId: string,
    storeId: string,
  ): Promise<InterviewEntity[]> {
    return this.recruitmentRepository.findInterviewsByApplicant(applicantId, storeId)
  }

  // --- Performance ---
  async createPerformanceReview(
    data: Partial<PerformanceReviewEntity>,
  ): Promise<PerformanceReviewEntity> {
    return this.performanceRepository.createPerformanceReview(data)
  }

  async findAllPerformanceReviews(storeId: string): Promise<PerformanceReviewEntity[]> {
    return this.performanceRepository.findAllPerformanceReviews(storeId)
  }

  async findEmployeeReviews(
    employeeId: string,
    storeId: string,
  ): Promise<PerformanceReviewEntity[]> {
    return this.performanceRepository.findEmployeeReviews(employeeId, storeId)
  }

  // --- Holidays ---
  async findHolidaysInRange(
    storeId: string,
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<HolidayEntity[]> {
    return this.employeeRepository.findHolidaysInRange(storeId, startDate, endDate, branchId)
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
  async nextEmployeeId(storeId: string): Promise<string> {
    return this.employeeRepository.nextEmployeeId(storeId)
  }

  async getStats(storeId: string, branchId?: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const employeeWhere: FindOptionsWhere<EmployeeEntity> = { storeId }
    const attendanceWhere: FindOptionsWhere<AttendanceSessionEntity> = {
      storeId,
      checkIn: MoreThanOrEqual(today) as any,
    }
    const jobWhere: FindOptionsWhere<JobPostingEntity> = { storeId, status: 'PUBLISHED' as any }
    const applicantWhere: FindOptionsWhere<ApplicantEntity> = { storeId }
    const leaveWhere: FindOptionsWhere<LeaveRequestEntity> = { storeId, status: 'PENDING' as any }

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
