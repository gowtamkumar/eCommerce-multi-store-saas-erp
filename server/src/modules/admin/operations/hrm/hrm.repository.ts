import { ApplicantStatus, PayrollBatchStatus } from '@/common/enums/hrm/hrm-enums'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Between,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm'
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

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

const DEFAULT_LIMIT = 20

@Injectable()
export class HrmRepository {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepo: Repository<DepartmentEntity>,
    @InjectRepository(DesignationEntity)
    private readonly designationRepo: Repository<DesignationEntity>,
    @InjectRepository(EmployeeEntity)
    public readonly employeeRepo: Repository<EmployeeEntity>,
    @InjectRepository(EmployeePersonalDetailsEntity)
    public readonly personalDetailsRepo: Repository<EmployeePersonalDetailsEntity>,
    @InjectRepository(EmployeeDocumentEntity)
    public readonly documentRepo: Repository<EmployeeDocumentEntity>,
    @InjectRepository(ShiftEntity)
    private readonly shiftRepo: Repository<ShiftEntity>,
    @InjectRepository(EmployeeShiftAssignmentEntity)
    private readonly shiftAssignmentRepo: Repository<EmployeeShiftAssignmentEntity>,
    @InjectRepository(AttendanceEventEntity)
    private readonly attendanceEventRepo: Repository<AttendanceEventEntity>,
    @InjectRepository(AttendanceSessionEntity)
    private readonly attendanceSessionRepo: Repository<AttendanceSessionEntity>,
    @InjectRepository(LeaveRequestEntity)
    public readonly leaveRequestRepo: Repository<LeaveRequestEntity>,
    @InjectRepository(LeaveQuotaEntity)
    public readonly leaveQuotaRepo: Repository<LeaveQuotaEntity>,
    @InjectRepository(PayrollBatchEntity)
    public readonly payrollBatchRepo: Repository<PayrollBatchEntity>,
    @InjectRepository(PayrollSlipEntity)
    private readonly payrollSlipRepo: Repository<PayrollSlipEntity>,
    @InjectRepository(JobPostingEntity)
    private readonly jobPostingRepo: Repository<JobPostingEntity>,
    @InjectRepository(ApplicantEntity)
    public readonly applicantRepo: Repository<ApplicantEntity>,
    @InjectRepository(InterviewEntity)
    private readonly interviewRepo: Repository<InterviewEntity>,
    @InjectRepository(PerformanceReviewEntity)
    private readonly performanceReviewRepo: Repository<PerformanceReviewEntity>,
    @InjectRepository(HolidayEntity)
    public readonly holidayRepo: Repository<HolidayEntity>,
    @InjectRepository(TaxBracketEntity)
    public readonly taxBracketRepo: Repository<TaxBracketEntity>,
    @InjectRepository(EmployeeIdSequenceEntity)
    public readonly employeeIdSeqRepo: Repository<EmployeeIdSequenceEntity>,
  ) {}

  // --- Department ---
  async createDepartment(data: Partial<DepartmentEntity>): Promise<DepartmentEntity> {
    return this.departmentRepo.save(this.departmentRepo.create(data))
  }

  async findAllDepartments(tenantId: string): Promise<DepartmentEntity[]> {
    return this.departmentRepo.find({ where: { tenantId } })
  }

  async findDepartmentById(id: string, tenantId: string): Promise<DepartmentEntity | null> {
    return this.departmentRepo.findOne({ where: { id, tenantId } })
  }

  async updateDepartment(id: string, data: Partial<DepartmentEntity>): Promise<void> {
    await this.departmentRepo.update(id, data)
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.departmentRepo.delete(id)
  }

  // --- Designation ---
  async createDesignation(data: Partial<DesignationEntity>): Promise<DesignationEntity> {
    return this.designationRepo.save(this.designationRepo.create(data))
  }

  async findAllDesignations(tenantId: string): Promise<DesignationEntity[]> {
    return this.designationRepo.find({
      where: { tenantId },
      relations: {
        department: true,
      },
    })
  }

  async findDesignationById(id: string, tenantId: string): Promise<DesignationEntity | null> {
    return this.designationRepo.findOne({ where: { id, tenantId } })
  }

  async updateDesignation(id: string, data: Partial<DesignationEntity>): Promise<void> {
    await this.designationRepo.update(id, data)
  }

  async deleteDesignation(id: string): Promise<void> {
    await this.designationRepo.delete(id)
  }

  // --- Employee ---
  async createEmployee(data: Partial<EmployeeEntity>): Promise<EmployeeEntity> {
    return this.employeeRepo.save(this.employeeRepo.create(data))
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
    const page = options?.page ?? 1
    const limit = options?.limit ?? DEFAULT_LIMIT
    const where: FindOptionsWhere<EmployeeEntity> = { tenantId }
    if (branchId) where.branchId = branchId
    if (options?.departmentId) where.departmentId = options.departmentId
    if (options?.status) where.status = options.status as any

    const qb = this.employeeRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.user', 'user')
      .leftJoinAndSelect('e.department', 'department')
      .leftJoinAndSelect('e.designation', 'designation')
      .leftJoinAndSelect('e.branch', 'branch')
      .leftJoinAndSelect('e.manager', 'manager')
      .leftJoinAndSelect('e.personalDetails', 'personalDetails')
      .where('e.tenantId = :tenantId', { tenantId })

    if (branchId) qb.andWhere('e.branchId = :branchId', { branchId })
    if (options?.departmentId)
      qb.andWhere('e.departmentId = :departmentId', { departmentId: options.departmentId })
    if (options?.status) qb.andWhere('e.status = :status', { status: options.status })
    if (options?.q) {
      qb.andWhere('(user.name ILIKE :q OR user.username ILIKE :q OR e.employeeId ILIKE :q)', {
        q: `%${options.q}%`,
      })
    }

    qb.orderBy('e.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, limit }
  }

  async findEmployeesAll(tenantId: string, branchId?: string): Promise<EmployeeEntity[]> {
    const where: FindOptionsWhere<EmployeeEntity> = { tenantId }
    if (branchId) where.branchId = branchId
    return this.employeeRepo.find({
      where,
      relations: {
        user: true,
        department: true,
        designation: true,
        branch: true,
        manager: true,
        personalDetails: true,
      },
    })
  }

  async findEmployeeById(id: string, tenantId: string): Promise<EmployeeEntity | null> {
    return this.employeeRepo.findOne({
      where: { id, tenantId },
      relations: {
        user: true,
        department: true,
        designation: true,
        branch: true,
        manager: true,
        personalDetails: true,
        documents: true,
      },
    })
  }

  async updateEmployee(id: string, data: Partial<EmployeeEntity>): Promise<void> {
    await this.employeeRepo.update(id, data)
  }

  // --- Shifts ---
  async createShift(data: Partial<ShiftEntity>): Promise<ShiftEntity> {
    return this.shiftRepo.save(this.shiftRepo.create(data))
  }

  async findAllShifts(tenantId: string): Promise<ShiftEntity[]> {
    return this.shiftRepo.find({ where: { tenantId } })
  }

  async findShiftById(id: string, tenantId: string): Promise<ShiftEntity | null> {
    return this.shiftRepo.findOne({ where: { id, tenantId } })
  }

  async updateShift(id: string, data: Partial<ShiftEntity>): Promise<void> {
    await this.shiftRepo.update(id, data)
  }

  async deleteShift(id: string): Promise<void> {
    await this.shiftRepo.delete(id)
  }

  async assignShift(
    data: Partial<EmployeeShiftAssignmentEntity>,
  ): Promise<EmployeeShiftAssignmentEntity> {
    return this.shiftAssignmentRepo.save(this.shiftAssignmentRepo.create(data))
  }

  async findEmployeeShiftAssignments(
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeShiftAssignmentEntity[]> {
    return this.shiftAssignmentRepo.find({
      where: { employeeId, tenantId },
      relations: {
        shift: true,
      },
      order: { effectiveFrom: 'DESC' },
    })
  }

  /**
   * Find the active shift assignment whose date range contains `date`.
   * Honours both `effectiveFrom` and `effectiveTo`.
   */
  async findEmployeeShift(
    employeeId: string,
    date: Date,
    tenantId: string,
  ): Promise<EmployeeShiftAssignmentEntity | null> {
    const qb = this.shiftAssignmentRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.shift', 'shift')
      .where('a.employeeId = :employeeId', { employeeId })
      .andWhere('a.tenantId = :tenantId', { tenantId })
      .andWhere('a.effectiveFrom <= :date', { date })
      .andWhere('(a.effectiveTo IS NULL OR a.effectiveTo >= :date)', { date })
      .orderBy('a.effectiveFrom', 'DESC')
      .limit(1)
    return qb.getOne()
  }

  // --- Attendance ---
  async logAttendanceEvent(data: Partial<AttendanceEventEntity>): Promise<AttendanceEventEntity> {
    return this.attendanceEventRepo.save(this.attendanceEventRepo.create(data))
  }

  async saveAttendanceSession(
    data: Partial<AttendanceSessionEntity>,
  ): Promise<AttendanceSessionEntity> {
    return this.attendanceSessionRepo.save(this.attendanceSessionRepo.create(data))
  }

  async findLatestAttendanceSession(
    employeeId: string,
    tenantId: string,
  ): Promise<AttendanceSessionEntity | null> {
    return this.attendanceSessionRepo.findOne({
      where: { employeeId, tenantId },
      order: { checkIn: 'DESC' },
    })
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
    const page = options?.page ?? 1
    const limit = options?.limit ?? DEFAULT_LIMIT

    const qb = this.attendanceSessionRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.designation', 'designation')
      .where('s.tenantId = :tenantId', { tenantId })

    if (branchId) qb.andWhere('s.branchId = :branchId', { branchId })
    if (options?.employeeId)
      qb.andWhere('s.employeeId = :employeeId', { employeeId: options.employeeId })
    if (options?.from) qb.andWhere('s.checkIn >= :from', { from: options.from })
    if (options?.to) qb.andWhere('s.checkIn <= :to', { to: options.to })

    qb.orderBy('s.checkIn', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, limit }
  }

  async findAttendanceSessionsForEmployee(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<AttendanceSessionEntity[]> {
    return this.attendanceSessionRepo.find({
      where: {
        employeeId,
        tenantId,
        checkIn: Between(startDate, endDate),
      },
      order: { checkIn: 'ASC' },
    })
  }

  async findAttendanceSessionsForEmployees(
    employeeIds: string[],
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<AttendanceSessionEntity[]> {
    if (employeeIds.length === 0) return []
    return this.attendanceSessionRepo.find({
      where: {
        employeeId: In(employeeIds),
        tenantId,
        checkIn: Between(startDate, endDate),
      },
      order: { checkIn: 'ASC' },
    })
  }

  // --- Leaves ---
  async createLeaveRequest(data: Partial<LeaveRequestEntity>): Promise<LeaveRequestEntity> {
    return this.leaveRequestRepo.save(this.leaveRequestRepo.create(data))
  }

  async updateLeaveRequest(id: string, data: Partial<LeaveRequestEntity>): Promise<void> {
    await this.leaveRequestRepo.update(id, data)
  }

  async findLeaveRequestById(id: string, tenantId: string): Promise<LeaveRequestEntity | null> {
    return this.leaveRequestRepo.findOne({ where: { id, tenantId } })
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
    const page = options?.page ?? 1
    const limit = options?.limit ?? DEFAULT_LIMIT

    const qb = this.leaveRequestRepo
      .createQueryBuilder('lr')
      .leftJoinAndSelect('lr.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'eu')
      .leftJoinAndSelect('employee.department', 'ed')
      .leftJoinAndSelect('lr.approvedBy', 'approvedBy')
      .leftJoinAndSelect('approvedBy.user', 'au')
      .where('lr.tenantId = :tenantId', { tenantId })

    if (options?.employeeId)
      qb.andWhere('lr.employeeId = :employeeId', { employeeId: options.employeeId })
    if (options?.status) qb.andWhere('lr.status = :status', { status: options.status })
    if (options?.from) qb.andWhere('lr.endDate >= :from', { from: options.from })
    if (options?.to) qb.andWhere('lr.startDate <= :to', { to: options.to })

    qb.orderBy('lr.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, limit }
  }

  async findOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    tenantId: string,
    excludeId?: string,
  ): Promise<LeaveRequestEntity[]> {
    const qb = this.leaveRequestRepo
      .createQueryBuilder('lr')
      .where('lr.employeeId = :employeeId', { employeeId })
      .andWhere('lr.tenantId = :tenantId', { tenantId })
      .andWhere('lr.status IN (:...statuses)', { statuses: ['PENDING', 'APPROVED'] })
      .andWhere('lr.startDate <= :endDate', { endDate })
      .andWhere('lr.endDate >= :startDate', { startDate })
    if (excludeId) qb.andWhere('lr.id != :excludeId', { excludeId })
    return qb.getMany()
  }

  async findLeaveQuota(
    employeeId: string,
    year: number,
    tenantId: string,
  ): Promise<LeaveQuotaEntity[]> {
    return this.leaveQuotaRepo.find({ where: { employeeId, year, tenantId } })
  }

  // --- Payroll ---
  async findActivePayrollBatchForPeriod(
    tenantId: string,
    period: string,
  ): Promise<PayrollBatchEntity | null> {
    return this.payrollBatchRepo.findOne({
      where: {
        tenantId,
        period,
        status: Not(PayrollBatchStatus.CANCELLED),
      },
    })
  }

  async findAllPayrollBatches(tenantId: string): Promise<PayrollBatchEntity[]> {
    return this.payrollBatchRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findPayrollBatchById(id: string, tenantId: string): Promise<PayrollBatchEntity | null> {
    return this.payrollBatchRepo.findOne({ where: { id, tenantId } })
  }

  async updatePayrollBatch(id: string, data: Partial<PayrollBatchEntity>): Promise<void> {
    await this.payrollBatchRepo.update(id, data)
  }

  async findPayrollSlipsByBatch(batchId: string, tenantId: string): Promise<PayrollSlipEntity[]> {
    return this.payrollSlipRepo.find({
      where: { batchId, tenantId },
      relations: {
        employee: {
          user: true,
          department: true,
          designation: true,
        },
      },
    })
  }

  // --- Recruitment ---
  async createJobPosting(data: Partial<JobPostingEntity>): Promise<JobPostingEntity> {
    return this.jobPostingRepo.save(this.jobPostingRepo.create(data))
  }

  async findAllJobPostings(tenantId: string): Promise<JobPostingEntity[]> {
    return this.jobPostingRepo.find({
      where: { tenantId },
      relations: {
        department: true,
      },
    })
  }

  async createApplicant(data: Partial<ApplicantEntity>): Promise<ApplicantEntity> {
    return this.applicantRepo.save(this.applicantRepo.create(data))
  }

  async findAllApplicants(tenantId: string): Promise<ApplicantEntity[]> {
    return this.applicantRepo.find({
      where: { tenantId },
      relations: {
        jobPosting: true,
        interviews: true,
      },
      order: { createdAt: 'DESC' },
    })
  }

  async findApplicantById(id: string, tenantId: string): Promise<ApplicantEntity | null> {
    return this.applicantRepo.findOne({
      where: { id, tenantId },
      relations: {
        jobPosting: true,
      },
    })
  }

  async updateApplicantStatus(id: string, status: ApplicantStatus): Promise<void> {
    await this.applicantRepo.update(id, { status })
  }

  async scheduleInterview(data: Partial<InterviewEntity>): Promise<InterviewEntity> {
    return this.interviewRepo.save(this.interviewRepo.create(data))
  }

  async findInterviewsByApplicant(
    applicantId: string,
    tenantId: string,
  ): Promise<InterviewEntity[]> {
    return this.interviewRepo.find({
      where: { applicantId, tenantId },
      relations: {
        interviewer: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    })
  }

  // --- Performance ---
  async createPerformanceReview(
    data: Partial<PerformanceReviewEntity>,
  ): Promise<PerformanceReviewEntity> {
    return this.performanceReviewRepo.save(this.performanceReviewRepo.create(data))
  }

  async findAllPerformanceReviews(tenantId: string): Promise<PerformanceReviewEntity[]> {
    return this.performanceReviewRepo.find({
      where: { tenantId },
      relations: {
        employee: {
          user: true,
          department: true,
        },
        reviewer: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    })
  }

  async findEmployeeReviews(
    employeeId: string,
    tenantId: string,
  ): Promise<PerformanceReviewEntity[]> {
    return this.performanceReviewRepo.find({
      where: { employeeId, tenantId },
      relations: {
        reviewer: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    })
  }

  // --- Holidays ---
  async findHolidaysInRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<HolidayEntity[]> {
    const qb = this.holidayRepo
      .createQueryBuilder('h')
      .where('h.tenantId = :tenantId', { tenantId })
      .andWhere('h.date >= :startDate', { startDate })
      .andWhere('h.date <= :endDate', { endDate })

    if (branchId) {
      qb.andWhere('(h.branchId IS NULL OR h.branchId = :branchId)', { branchId })
    }
    return qb.getMany()
  }

  async findHolidaysExpiringSoon(referenceDate: Date): Promise<EmployeeDocumentEntity[]> {
    return this.documentRepo.find({
      where: {
        expiryDate: LessThanOrEqual(referenceDate),
      } as any,
    })
  }

  async findExpiringDocuments(daysAhead: number): Promise<EmployeeDocumentEntity[]> {
    const now = new Date()
    const ahead = new Date()
    ahead.setDate(ahead.getDate() + daysAhead)

    return this.documentRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .where('d.expiryDate IS NOT NULL')
      .andWhere('d.expiryDate >= :now', { now })
      .andWhere('d.expiryDate <= :ahead', { ahead })
      .getMany()
  }

  // --- Probation auto-confirmation ---
  async findEmployeesEligibleForProbationCompletion(
    referenceDate: Date,
    probationDays: number,
  ): Promise<EmployeeEntity[]> {
    const cutoff = new Date(referenceDate)
    cutoff.setDate(cutoff.getDate() - probationDays)

    return this.employeeRepo.find({
      where: {
        status: 'PROBATION' as any,
        joiningDate: LessThanOrEqual(cutoff) as any,
      },
      relations: {
        user: true,
      },
    })
  }

  // --- Employee ID sequence ---
  /**
   * Atomically increments the per-tenant employee-id counter and returns the
   * generated code. Uses a single UPDATE with RETURNING so concurrent calls
   * cannot mint duplicates.
   */
  async nextEmployeeId(tenantId: string): Promise<string> {
    let seq = await this.employeeIdSeqRepo.findOne({ where: { tenantId } })
    if (!seq) {
      seq = this.employeeIdSeqRepo.create({ tenantId })
      try {
        await this.employeeIdSeqRepo.save(seq)
      } catch {
        // race: another caller created it concurrently
        seq = await this.employeeIdSeqRepo.findOne({ where: { tenantId } })
      }
    }

    const result = await this.employeeIdSeqRepo
      .createQueryBuilder()
      .update(EmployeeIdSequenceEntity)
      .set({ lastValue: () => '"last_value" + 1' })
      .where('tenant_id = :tenantId', { tenantId })
      .returning(['lastValue', 'prefix', 'padLength'])
      .execute()

    const row = (result.raw && result.raw[0]) || {}
    const lastValue = Number(row.last_value ?? row.lastValue ?? seq?.lastValue ?? 1)
    const prefix = row.prefix ?? seq?.prefix ?? 'EMP-'
    const padLength = Number(row.pad_length ?? row.padLength ?? seq?.padLength ?? 6)
    return `${prefix}${String(lastValue).padStart(padLength, '0')}`
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
        this.employeeRepo.count({ where: employeeWhere }),
        this.jobPostingRepo.count({ where: jobWhere }),
        this.applicantRepo.count({ where: applicantWhere }),
        this.attendanceSessionRepo.count({ where: attendanceWhere }),
        this.leaveRequestRepo.count({ where: leaveWhere }),
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
