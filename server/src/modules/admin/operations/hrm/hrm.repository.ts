import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { ApplicantStatus } from '@/common/enums/hrm/hrm-enums'
import { DepartmentEntity } from './entities/department.entity'
import { DesignationEntity } from './entities/designation.entity'
import { EmployeeEntity } from './entities/employee.entity'
import { EmployeePersonalDetailsEntity } from './entities/employee-personal-details.entity'
import { EmployeeDocumentEntity } from './entities/employee-document.entity'
import { ShiftEntity, EmployeeShiftAssignmentEntity } from './entities/shift.entity'
import { AttendanceEventEntity } from './entities/attendance-event.entity'
import { AttendanceSessionEntity } from './entities/attendance.entity'
import { LeaveRequestEntity, LeaveQuotaEntity } from './entities/leave.entity'
import { PayrollBatchEntity, PayrollSlipEntity } from './entities/payroll.entity'
import { JobPostingEntity, ApplicantEntity, InterviewEntity } from './entities/recruitment.entity'
import { PerformanceReviewEntity } from './entities/performance.entity'

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
    private readonly personalDetailsRepo: Repository<EmployeePersonalDetailsEntity>,
    @InjectRepository(EmployeeDocumentEntity)
    private readonly documentRepo: Repository<EmployeeDocumentEntity>,
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

  // --- Designation ---
  async createDesignation(data: Partial<DesignationEntity>): Promise<DesignationEntity> {
    return this.designationRepo.save(this.designationRepo.create(data))
  }

  async findAllDesignations(tenantId: string): Promise<DesignationEntity[]> {
    return this.designationRepo.find({ where: { tenantId }, relations: ['department'] })
  }

  // --- Employee ---
  async createEmployee(data: Partial<EmployeeEntity>): Promise<EmployeeEntity> {
    return this.employeeRepo.save(this.employeeRepo.create(data))
  }

  async findAllEmployees(tenantId: string): Promise<EmployeeEntity[]> {
    return this.employeeRepo.find({
      where: { tenantId },
      relations: ['user', 'department', 'designation', 'branch', 'warehouse', 'manager', 'personalDetails'],
    })
  }

  async findEmployeeById(id: string, tenantId: string): Promise<EmployeeEntity | null> {
    return this.employeeRepo.findOne({
      where: { id, tenantId },
      relations: ['user', 'department', 'designation', 'branch', 'warehouse', 'manager', 'personalDetails', 'documents'],
    })
  }

  async updateEmployee(id: string, data: Partial<EmployeeEntity>): Promise<void> {
    await this.employeeRepo.update(id, data)
  }

  // --- Shifts ---
  async createShift(data: Partial<ShiftEntity>): Promise<ShiftEntity> {
    return this.shiftRepo.save(this.shiftRepo.create(data))
  }

  async assignShift(data: Partial<EmployeeShiftAssignmentEntity>): Promise<EmployeeShiftAssignmentEntity> {
    return this.shiftAssignmentRepo.save(this.shiftAssignmentRepo.create(data))
  }

  async findEmployeeShift(employeeId: string, date: Date, tenantId: string): Promise<EmployeeShiftAssignmentEntity | null> {
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

  async saveAttendanceSession(data: Partial<AttendanceSessionEntity>): Promise<AttendanceSessionEntity> {
    return this.attendanceSessionRepo.save(this.attendanceSessionRepo.create(data))
  }

  async findLatestAttendanceSession(employeeId: string, tenantId: string): Promise<AttendanceSessionEntity | null> {
    return this.attendanceSessionRepo.findOne({
      where: { employeeId, tenantId },
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

  async findLeaveQuota(employeeId: string, year: number, tenantId: string): Promise<LeaveQuotaEntity[]> {
    return this.leaveQuotaRepo.find({ where: { employeeId, year, tenantId } })
  }

  // --- Payroll ---
  async createPayrollBatch(data: Partial<PayrollBatchEntity>): Promise<PayrollBatchEntity> {
    return this.payrollBatchRepo.save(this.payrollBatchRepo.create(data))
  }

  async createPayrollSlip(data: Partial<PayrollSlipEntity>): Promise<PayrollSlipEntity> {
    return this.payrollSlipRepo.save(this.payrollSlipRepo.create(data))
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

  async findApplicantsByJob(jobPostingId: string, tenantId: string): Promise<ApplicantEntity[]> {
    return this.applicantRepo.find({ where: { jobPostingId, tenantId }, relations: ['interviews'] })
  }

  async updateApplicantStatus(id: string, status: ApplicantStatus): Promise<void> {
    await this.applicantRepo.update(id, { status })
  }

  async scheduleInterview(data: Partial<InterviewEntity>): Promise<InterviewEntity> {
    return this.interviewRepo.save(this.interviewRepo.create(data))
  }

  // --- Performance ---
  async createPerformanceReview(data: Partial<PerformanceReviewEntity>): Promise<PerformanceReviewEntity> {
    return this.performanceReviewRepo.save(this.performanceReviewRepo.create(data))
  }

  async findEmployeeReviews(employeeId: string, tenantId: string): Promise<PerformanceReviewEntity[]> {
    return this.performanceReviewRepo.find({ where: { employeeId, tenantId }, relations: ['reviewer'] })
  }
}
