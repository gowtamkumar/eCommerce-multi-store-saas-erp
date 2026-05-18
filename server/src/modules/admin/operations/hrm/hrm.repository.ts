import { ApplicantStatus } from '@/common/enums/hrm/hrm-enums'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, Repository } from 'typeorm'
import { AttendanceEventEntity } from './entities/attendance-event.entity'
import { AttendanceSessionEntity } from './entities/attendance.entity'
import { DepartmentEntity } from './entities/department.entity'
import { DesignationEntity } from './entities/designation.entity'
import { EmployeeDocumentEntity } from './entities/employee-document.entity'
import { EmployeePersonalDetailsEntity } from './entities/employee-personal-details.entity'
import { EmployeeEntity } from './entities/employee.entity'
import { LeaveQuotaEntity, LeaveRequestEntity } from './entities/leave.entity'
import { PayrollBatchEntity, PayrollSlipEntity } from './entities/payroll.entity'
import { PerformanceReviewEntity } from './entities/performance.entity'
import { ApplicantEntity, InterviewEntity, JobPostingEntity } from './entities/recruitment.entity'
import { EmployeeShiftAssignmentEntity, ShiftEntity } from './entities/shift.entity'

@Injectable()
export class HrmRepository {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepo: Repository<DepartmentEntity>,
    @InjectRepository(DesignationEntity)
    private readonly designationRepo: Repository<DesignationEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepo: Repository<EmployeeEntity>,
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
    private readonly leaveRequestRepo: Repository<LeaveRequestEntity>,
    @InjectRepository(LeaveQuotaEntity)
    private readonly leaveQuotaRepo: Repository<LeaveQuotaEntity>,
    @InjectRepository(PayrollBatchEntity)
    private readonly payrollBatchRepo: Repository<PayrollBatchEntity>,
    @InjectRepository(PayrollSlipEntity)
    private readonly payrollSlipRepo: Repository<PayrollSlipEntity>,
    @InjectRepository(JobPostingEntity)
    private readonly jobPostingRepo: Repository<JobPostingEntity>,
    @InjectRepository(ApplicantEntity)
    private readonly applicantRepo: Repository<ApplicantEntity>,
    @InjectRepository(InterviewEntity)
    private readonly interviewRepo: Repository<InterviewEntity>,
    @InjectRepository(PerformanceReviewEntity)
    private readonly performanceReviewRepo: Repository<PerformanceReviewEntity>,
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
    return this.designationRepo.find({ where: { tenantId }, relations: ['department'] })
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

  async findAllEmployees(tenantId: string): Promise<EmployeeEntity[]> {
    return this.employeeRepo.find({
      where: { tenantId },
      relations: ['user', 'department', 'designation', 'branch', 'manager', 'personalDetails'],
    })
  }

  async findEmployeeById(id: string, tenantId: string): Promise<EmployeeEntity | null> {
    return this.employeeRepo.findOne({
      where: { id, tenantId },
      relations: [
        'user',
        'department',
        'designation',
        'branch',
        'manager',
        'personalDetails',
        'documents',
      ],
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
      relations: ['shift'],
      order: { effectiveFrom: 'DESC' },
    })
  }

  async findEmployeeShift(
    employeeId: string,
    date: Date,
    tenantId: string,
  ): Promise<EmployeeShiftAssignmentEntity | null> {
    return this.shiftAssignmentRepo.findOne({
      where: { employeeId, tenantId, effectiveFrom: Between(new Date(0), date) }, // Simple logic for now
      relations: ['shift'],
      order: { effectiveFrom: 'DESC' },
    })
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
      order: { clockIn: 'DESC' },
    })
  }

  async findAllAttendanceSessions(tenantId: string): Promise<AttendanceSessionEntity[]> {
    return this.attendanceSessionRepo.find({
      where: { tenantId },
      relations: ['employee', 'employee.user', 'employee.department', 'employee.designation'],
      order: { clockIn: 'DESC' },
    })
  }

  // --- Leaves ---
  async createLeaveRequest(data: Partial<LeaveRequestEntity>): Promise<LeaveRequestEntity> {
    return this.leaveRequestRepo.save(this.leaveRequestRepo.create(data))
  }

  async updateLeaveRequest(id: string, data: Partial<LeaveRequestEntity>): Promise<void> {
    await this.leaveRequestRepo.update(id, data)
  }

  async findAllLeaveRequests(tenantId: string): Promise<LeaveRequestEntity[]> {
    return this.leaveRequestRepo.find({
      where: { tenantId },
      relations: [
        'employee',
        'employee.user',
        'employee.department',
        'approvedBy',
        'approvedBy.user',
      ],
      order: { createdAt: 'DESC' },
    })
  }

  async findLeaveQuota(
    employeeId: string,
    year: number,
    tenantId: string,
  ): Promise<LeaveQuotaEntity[]> {
    return this.leaveQuotaRepo.find({ where: { employeeId, year, tenantId } })
  }

  // --- Payroll ---
  async createPayrollBatch(data: Partial<PayrollBatchEntity>): Promise<PayrollBatchEntity> {
    return this.payrollBatchRepo.save(this.payrollBatchRepo.create(data))
  }

  async findAllPayrollBatches(tenantId: string): Promise<PayrollBatchEntity[]> {
    return this.payrollBatchRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async createPayrollSlip(data: Partial<PayrollSlipEntity>): Promise<PayrollSlipEntity> {
    return this.payrollSlipRepo.save(this.payrollSlipRepo.create(data))
  }

  async findPayrollSlipsByBatch(batchId: string, tenantId: string): Promise<PayrollSlipEntity[]> {
    return this.payrollSlipRepo.find({
      where: { batchId, tenantId },
      relations: ['employee', 'employee.user', 'employee.department', 'employee.designation'],
    })
  }

  // --- Recruitment ---
  async createJobPosting(data: Partial<JobPostingEntity>): Promise<JobPostingEntity> {
    return this.jobPostingRepo.save(this.jobPostingRepo.create(data))
  }

  async findAllJobPostings(tenantId: string): Promise<JobPostingEntity[]> {
    return this.jobPostingRepo.find({ where: { tenantId }, relations: ['department'] })
  }

  async createApplicant(data: Partial<ApplicantEntity>): Promise<ApplicantEntity> {
    return this.applicantRepo.save(this.applicantRepo.create(data))
  }

  async findAllApplicants(tenantId: string): Promise<ApplicantEntity[]> {
    return this.applicantRepo.find({
      where: { tenantId },
      relations: ['jobPosting', 'interviews'],
      order: { createdAt: 'DESC' },
    })
  }

  async findApplicantsByJob(jobPostingId: string, tenantId: string): Promise<ApplicantEntity[]> {
    return this.applicantRepo.find({ where: { jobPostingId, tenantId }, relations: ['interviews'] })
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
      relations: ['interviewer', 'interviewer.user'],
      order: { createdAt: 'DESC' },
    })
  }

  // --- Performance ---
  async createPerformanceReview(
    data: Partial<PerformanceReviewEntity>,
  ): Promise<PerformanceReviewEntity> {
    return this.performanceReviewRepo.save(this.performanceReviewRepo.create(data))
  }

  async findEmployeeReviews(
    employeeId: string,
    tenantId: string,
  ): Promise<PerformanceReviewEntity[]> {
    return this.performanceReviewRepo.find({
      where: { employeeId, tenantId },
      relations: ['reviewer'],
    })
  }
  async getStats(tenantId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [employeeCount, jobCount, applicantCount, attendanceCount, leaveCount] =
      await Promise.all([
        this.employeeRepo.count({ where: { tenantId } }),
        this.jobPostingRepo.count({ where: { tenantId, status: 'PUBLISHED' as any } }),
        this.applicantRepo.count({ where: { tenantId } }),
        this.attendanceSessionRepo.count({
          where: {
            tenantId,
            clockIn: Between(today, new Date()),
          },
        }),
        this.leaveRequestRepo.count({
          where: {
            tenantId,
            status: 'PENDING' as any,
          },
        }),
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
