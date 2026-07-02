import { RequestContextDto } from '@/common/dto/request-context.dto'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { Injectable } from '@nestjs/common'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'

@Injectable()
export class HrmPerformanceService {
  constructor(
    private readonly hrmRepo: HrmRepository,
    private readonly auditLogService: AuditLogService,
    private readonly employeeService: HrmEmployeeService,
  ) {}

  // --- Performance & KPIs ---
  async createPerformanceReview(data: any, ctx: RequestContextDto) {
    const review = await this.hrmRepo.createPerformanceReview({
      ...data,
      storeId: ctx.storeId,
    })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'PerformanceReview',
      entityId: review.id,
      newValue: review,
    })
    return review
  }

  async getEmployeePerformanceScore(employeeId: string, period: string, ctx: RequestContextDto) {
    const employee = await this.employeeService.findOneEmployee(employeeId, ctx)

    const salesVolume = 0
    const pickSpeed = 0

    return {
      employeeId,
      period,
      metrics: [
        { name: 'Sales Volume', value: salesVolume, target: 50000, unit: 'USD' },
        { name: 'Fulfillment Speed', value: pickSpeed, target: 120, unit: 'sec/item' },
      ],
    }
  }

  async getAllPerformanceReviews(ctx: RequestContextDto) {
    return this.hrmRepo.findAllPerformanceReviews(ctx.storeId)
  }

  async getEmployeeReviews(employeeId: string, ctx: RequestContextDto) {
    return this.hrmRepo.findEmployeeReviews(employeeId, ctx.storeId)
  }
}
