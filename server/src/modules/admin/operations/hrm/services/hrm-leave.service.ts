import { RequestContextDto } from '@/common/dto/request-context.dto'
import { LeaveStatus, LeaveType } from '@/common/enums/hrm/hrm-enums'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { LeaveRequestEntity } from '../entities/leave.entity'
import { countCalendarDays } from '../hrm.helpers'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'

@Injectable()
export class HrmLeaveService {
  private readonly logger = new Logger(HrmLeaveService.name)

  constructor(
    private readonly hrmRepo: HrmRepository,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
    private readonly employeeService: HrmEmployeeService,
  ) {}

  async requestLeave(
    employeeId: string,
    data: { leaveType: LeaveType; startDate: string; endDate: string; reason: string },
    ctx: RequestContextDto,
  ) {
    await this.employeeService.validateEmployeeInTenant(employeeId, ctx.tenantId)

    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    if (endDate < startDate) {
      throw new BadRequestException('End date must be on or after start date')
    }

    const totalDays = countCalendarDays(startDate, endDate)

    const overlapping = await this.hrmRepo.findOverlappingLeaves(
      employeeId,
      startDate,
      endDate,
      ctx.tenantId,
    )
    if (overlapping.length > 0) {
      throw new ConflictException(
        'This leave request overlaps with an existing pending or approved leave',
      )
    }

    const quotas = await this.hrmRepo.findLeaveQuota(
      employeeId,
      startDate.getFullYear(),
      ctx.tenantId,
    )
    const quota = quotas.find((q) => q.leaveType === data.leaveType)
    if (quota && quota.usedDays + totalDays > quota.totalDays) {
      throw new BadRequestException(`Insufficient leave balance for ${data.leaveType}`)
    }

    const res = await this.hrmRepo.createLeaveRequest({
      leaveType: data.leaveType,
      reason: data.reason,
      employeeId,
      tenantId: ctx.tenantId,
      startDate,
      endDate,
      totalDays,
    })

    try {
      const employee = await this.hrmRepo.findEmployeeById(employeeId, ctx.tenantId)
      const empName = employee?.user?.name || employee?.user?.username || 'An employee'
      await this.notificationService.createNotification(
        {
          title: 'New Leave Request Submitted',
          message: `${empName} has requested ${totalDays} day(s) of ${data.leaveType} leave starting ${startDate.toLocaleDateString()}.`,
          type: 'INFO',
          link: '/admin/hrm/leaves',
          userId: null,
        },
        ctx.tenantId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger leave request notification: ${e.message}`)
    }

    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'LeaveRequest',
      entityId: res.id,
      newValue: res,
    })
    return res
  }

  async approveLeave(
    requestId: string,
    approvedById: string,
    managerNote: string,
    ctx: RequestContextDto,
  ) {
    await this.employeeService.validateEmployeeInTenant(approvedById, ctx.tenantId)

    const request = await this.hrmRepo.findLeaveRequestById(requestId, ctx.tenantId)
    if (!request) throw new NotFoundException('Leave request not found')
    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Leave request is already ${request.status}`)
    }

    await this.hrmRepo.leaveRequestRepo.manager.transaction(async (em) => {
      await em.getRepository(LeaveRequestEntity).update(requestId, {
        status: LeaveStatus.APPROVED,
        approvedById,
        managerNote,
      })

      const year = new Date(request.startDate).getFullYear()
      const quotaResult = await em
        .createQueryBuilder()
        .update('leave_quotas')
        .set({ usedDays: () => `"used_days" + ${request.totalDays}` })
        .where('employee_id = :employeeId', { employeeId: request.employeeId })
        .andWhere('tenant_id = :tenantId', { tenantId: ctx.tenantId })
        .andWhere('leave_type = :leaveType', { leaveType: request.leaveType })
        .andWhere('year = :year', { year })
        .andWhere(`"used_days" + ${request.totalDays} <= "total_days"`)
        .execute()

      if (quotaResult.affected === 0) {
        const quota = await this.hrmRepo.findLeaveQuota(request.employeeId, year, ctx.tenantId)
        const match = quota.find((q) => q.leaveType === request.leaveType)
        if (match && match.usedDays + request.totalDays > match.totalDays) {
          throw new BadRequestException(`Insufficient leave balance for ${request.leaveType}`)
        }
      }
    })

    try {
      const employee = await this.hrmRepo.findEmployeeById(request.employeeId, ctx.tenantId)
      if (employee?.userId) {
        await this.notificationService.createNotification(
          {
            title: 'Leave Request Approved',
            message: `Your leave request for ${new Date(request.startDate).toLocaleDateString()} has been approved.`,
            type: 'SUCCESS',
            link: '/admin/profile',
            userId: employee.userId,
          },
          ctx.tenantId,
        )
      }
    } catch (e: any) {
      this.logger.error(`Failed to trigger leave approval notification: ${e.message}`)
    }

    await this.auditLogService.log(ctx, {
      action: 'APPROVE',
      entity: 'LeaveRequest',
      entityId: requestId,
      newValue: { status: LeaveStatus.APPROVED },
    })

    return this.hrmRepo.findLeaveRequestById(requestId, ctx.tenantId)
  }

  async rejectLeave(
    requestId: string,
    rejectedById: string,
    managerNote: string,
    ctx: RequestContextDto,
  ) {
    await this.employeeService.validateEmployeeInTenant(rejectedById, ctx.tenantId)

    const request = await this.hrmRepo.findLeaveRequestById(requestId, ctx.tenantId)
    if (!request) throw new NotFoundException('Leave request not found')
    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Leave request is already ${request.status}`)
    }

    await this.hrmRepo.updateLeaveRequest(requestId, {
      status: LeaveStatus.REJECTED,
      approvedById: rejectedById,
      managerNote,
    })

    try {
      const employee = await this.hrmRepo.findEmployeeById(request.employeeId, ctx.tenantId)
      if (employee?.userId) {
        await this.notificationService.createNotification(
          {
            title: 'Leave Request Rejected',
            message: `Your leave request for ${new Date(request.startDate).toLocaleDateString()} has been rejected.`,
            type: 'ERROR',
            link: '/admin/profile',
            userId: employee.userId,
          },
          ctx.tenantId,
        )
      }
    } catch (e: any) {
      this.logger.error(`Failed to trigger leave rejection notification: ${e.message}`)
    }

    await this.auditLogService.log(ctx, {
      action: 'REJECT',
      entity: 'LeaveRequest',
      entityId: requestId,
      newValue: { status: LeaveStatus.REJECTED },
    })
    return this.hrmRepo.findLeaveRequestById(requestId, ctx.tenantId)
  }

  async findAllLeaveRequests(
    ctx: RequestContextDto,
    options?: {
      page?: number
      limit?: number
      employeeId?: string
      status?: string
      from?: string
      to?: string
    },
  ) {
    return this.hrmRepo.findAllLeaveRequests(ctx.tenantId, {
      ...options,
      from: options?.from ? new Date(options.from) : undefined,
      to: options?.to ? new Date(options.to) : undefined,
    })
  }
}
