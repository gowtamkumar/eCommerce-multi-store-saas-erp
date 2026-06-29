import { RequestContextDto } from '@/common/dto/request-context.dto'
import {
  ApplicantStatus,
  EmployeeStatus,
  JobStatus,
} from '@/common/enums/hrm/hrm-enums'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as crypto from 'crypto'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'
import { EmployeeEntity } from '../entities/employee.entity'
import { EmployeePersonalDetailsEntity } from '../entities/employee-personal-details.entity'
import { ApplicantEntity } from '../entities/recruitment.entity'
import { LeaveQuotaEntity } from '../entities/leave.entity'
import { LeaveType } from '@/common/enums/hrm/hrm-enums'

@Injectable()
export class HrmRecruitmentService {
  private readonly logger = new Logger(HrmRecruitmentService.name)

  constructor(
    private readonly hrmRepo: HrmRepository,
    private readonly auditLogService: AuditLogService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly employeeService: HrmEmployeeService,
  ) {}

  // --- Recruitment (ATS) ---
  async findAllJobPostings(ctx: RequestContextDto) {
    return this.hrmRepo.findAllJobPostings(ctx.tenantId)
  }

  async createJobPosting(data: any, ctx: RequestContextDto) {
    const requestedStatus = String(data?.status || '').toUpperCase()
    const status =
      requestedStatus === 'OPEN'
        ? JobStatus.PUBLISHED
        : Object.values(JobStatus).includes(requestedStatus as JobStatus)
          ? (requestedStatus as JobStatus)
          : JobStatus.DRAFT

    const job = await this.hrmRepo.createJobPosting({
      ...data,
      tenantId: ctx.tenantId,
      status,
    })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'JobPosting',
      entityId: job.id,
      newValue: job,
    })
    return job
  }

  async findAllApplicants(ctx: RequestContextDto) {
    return this.hrmRepo.findAllApplicants(ctx.tenantId)
  }

  async applyForJob(data: any, ctx: RequestContextDto) {
    const applicant = await this.hrmRepo.createApplicant({
      ...data,
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'New Applicant',
      tenantId: ctx.tenantId,
      status: 'APPLIED',
    })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Applicant',
      entityId: applicant.id,
      newValue: applicant,
    })
    return applicant
  }

  async scheduleInterview(data: any, ctx: RequestContextDto) {
    const applicantId = data.applicantId
    const interviewerId = data.interviewerId
    const scheduledAtValue = data.scheduledAt ?? data.interviewDate
    const notes = data.notes ?? data.feedback

    if (!applicantId) {
      throw new BadRequestException('Applicant ID is required for scheduling an interview')
    }
    if (!interviewerId) {
      throw new BadRequestException('Interviewer ID is required for scheduling an interview')
    }

    const applicant = await this.hrmRepo.findApplicantById(applicantId, ctx.tenantId)
    if (!applicant) {
      throw new NotFoundException('Applicant not found')
    }

    await this.employeeService.findOneEmployee(interviewerId, ctx)

    const scheduledAt = scheduledAtValue ? new Date(scheduledAtValue) : null
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('A valid interview date/time is required')
    }

    const interview = await this.hrmRepo.scheduleInterview({
      applicantId,
      interviewerId,
      scheduledAt,
      feedback: notes,
      status: data.status || 'SCHEDULED',
      tenantId: ctx.tenantId,
    })
    await this.auditLogService.log(ctx, {
      action: 'SCHEDULE',
      entity: 'Interview',
      entityId: interview.id,
      newValue: interview,
    })
    return interview
  }

  async findInterviewsByApplicant(applicantId: string, ctx: RequestContextDto) {
    return this.hrmRepo.findInterviewsByApplicant(applicantId, ctx.tenantId)
  }

  async updateApplicantStatus(id: string, status: ApplicantStatus, ctx: RequestContextDto) {
    await this.hrmRepo.updateApplicantStatus(id, status)
    await this.auditLogService.log(ctx, {
      action: 'UPDATE_STATUS',
      entity: 'Applicant',
      entityId: id,
      newValue: { status },
    })
    return { id, status }
  }

  async onboardApplicant(id: string, ctx: RequestContextDto) {
    const applicant = await this.hrmRepo.findApplicantById(id, ctx.tenantId)
    if (!applicant) throw new NotFoundException('Applicant not found')

    let user = await this.userService.findUserByEmail(applicant.email, ctx.tenantId)
    if (!user) {
      const secureRandomPassword = crypto.randomBytes(16).toString('hex') + 'A1!'
      this.logger.log(`Creating new user account for applicant: ${applicant.email}`)
      user = await this.userService.createUser(
        {
          email: applicant.email,
          username: applicant.email,
          name: `${applicant.firstName} ${applicant.lastName}`.trim(),
          role: UserRole.EMPLOYEE,
          password: secureRandomPassword,
          tenantId: ctx.tenantId,
        } as any,
        ctx,
      )
    }

    const employee = await this.hrmRepo.employeeRepo.manager.transaction(async (em) => {
      const humanReadableId = await this.hrmRepo.nextEmployeeId(ctx.tenantId)
      const basicSalary = applicant.jobPosting?.salaryRangeMin ? Number(applicant.jobPosting.salaryRangeMin) : 0

      const employeeEntity = em.create(EmployeeEntity, {
        tenantId: ctx.tenantId,
        userId: user.id,
        departmentId: applicant.jobPosting?.departmentId,
        status: EmployeeStatus.PROBATION,
        employeeId: humanReadableId,
        joiningDate: new Date(),
        salaryConfig: {
          basicSalary,
          allowances: [],
          deductions: [],
        },
      })
      const savedEmployee = await em.save(EmployeeEntity, employeeEntity)

      // Create Personal Details
      const personalDetails = em.create(EmployeePersonalDetailsEntity, {
        userId: user.id,
        employeeId: savedEmployee.id,
        tenantId: ctx.tenantId,
      })
      await em.save(EmployeePersonalDetailsEntity, personalDetails)

      // Initialize default leave quotas
      const currentYear = new Date().getFullYear()
      const leaveQuotaRepo = em.getRepository(LeaveQuotaEntity)
      const defaults = [
        { leaveType: LeaveType.SICK, totalDays: 10 },
        { leaveType: LeaveType.CASUAL, totalDays: 10 },
        { leaveType: LeaveType.ANNUAL, totalDays: 15 },
        { leaveType: LeaveType.MATERNITY, totalDays: 90 },
        { leaveType: LeaveType.PATERNITY, totalDays: 10 },
      ]

      for (const d of defaults) {
        await leaveQuotaRepo.save(
          leaveQuotaRepo.create({
            employeeId: savedEmployee.id,
            tenantId: ctx.tenantId,
            leaveType: d.leaveType,
            totalDays: d.totalDays,
            usedDays: 0,
            year: currentYear,
          }),
        )
      }

      // Update applicant status to reflect onboarding completion
      await em.update(ApplicantEntity, id, { status: ApplicantStatus.JOINED })

      return savedEmployee
    })

    // Trigger Notification for Admin
    try {
      const applicantName = `${applicant.firstName} ${applicant.lastName}`.trim() || 'An applicant'
      await this.notificationService.createNotification(
        {
          title: 'Applicant Onboarded Successfully',
          message: `Applicant "${applicantName}" has been onboarded as an Employee.`,
          type: 'SUCCESS',
          link: '/admin/hrm/employees',
          userId: null as any, // Send to all admins
        },
        ctx.tenantId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger applicant onboarding notification: ${e.message}`)
    }

    await this.auditLogService.log(ctx, {
      action: 'ONBOARD',
      entity: 'Employee',
      entityId: employee.id,
      newValue: employee,
    })

    return employee
  }
}
