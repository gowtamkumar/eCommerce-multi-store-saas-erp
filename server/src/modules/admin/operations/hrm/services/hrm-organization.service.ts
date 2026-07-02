import { RequestContextDto } from '@/common/dto/request-context.dto'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  CreateDepartmentDto,
  CreateDesignationDto,
  UpdateDepartmentDto,
  UpdateDesignationDto,
} from '../dto/hrm.dto'
import { HrmRepository } from '../hrm.repository'

@Injectable()
export class HrmOrganizationService {
  private readonly logger = new Logger(HrmOrganizationService.name)

  constructor(
    private readonly hrmRepo: HrmRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  // --- Department CRUD ---
  async createDepartment(data: CreateDepartmentDto, ctx: RequestContextDto) {
    this.logger.log(`Creating department "${data.name}" for store ${ctx.storeId}`)
    const res = await this.hrmRepo.createDepartment({ ...data, storeId: ctx.storeId })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Department',
      entityId: res.id,
      newValue: res,
    })
    return res
  }

  async findAllDepartments(ctx: RequestContextDto) {
    return this.hrmRepo.findAllDepartments(ctx.storeId)
  }

  async updateDepartment(id: string, data: UpdateDepartmentDto, ctx: RequestContextDto) {
    this.logger.log(`Updating department ${id} for store ${ctx.storeId}`)
    const old = await this.hrmRepo.findDepartmentById(id, ctx.storeId)
    if (!old) throw new NotFoundException('Department not found')
    await this.hrmRepo.updateDepartment(id, data)
    const updated = await this.hrmRepo.findDepartmentById(id, ctx.storeId)
    await this.auditLogService.log(ctx, {
      action: 'UPDATE',
      entity: 'Department',
      entityId: id,
      oldValue: old,
      newValue: updated,
    })
    return updated
  }

  async deleteDepartment(id: string, ctx: RequestContextDto) {
    this.logger.log(`Deleting department ${id} for store ${ctx.storeId}`)
    const dept = await this.hrmRepo.findDepartmentById(id, ctx.storeId)
    if (!dept) throw new NotFoundException('Department not found')
    await this.hrmRepo.deleteDepartment(id)
    await this.auditLogService.log(ctx, {
      action: 'DELETE',
      entity: 'Department',
      entityId: id,
      oldValue: dept,
    })
    return { id }
  }

  // --- Designation CRUD ---
  async createDesignation(data: CreateDesignationDto, ctx: RequestContextDto) {
    this.logger.log(`Creating designation "${data.name}" for store ${ctx.storeId}`)
    const res = await this.hrmRepo.createDesignation({ ...data, storeId: ctx.storeId })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Designation',
      entityId: res.id,
      newValue: res,
    })
    return res
  }

  async findAllDesignations(ctx: RequestContextDto) {
    return this.hrmRepo.findAllDesignations(ctx.storeId)
  }

  async updateDesignation(id: string, data: UpdateDesignationDto, ctx: RequestContextDto) {
    this.logger.log(`Updating designation ${id} for store ${ctx.storeId}`)
    const old = await this.hrmRepo.findDesignationById(id, ctx.storeId)
    if (!old) throw new NotFoundException('Designation not found')
    await this.hrmRepo.updateDesignation(id, data)
    const updated = await this.hrmRepo.findDesignationById(id, ctx.storeId)
    await this.auditLogService.log(ctx, {
      action: 'UPDATE',
      entity: 'Designation',
      entityId: id,
      oldValue: old,
      newValue: updated,
    })
    return updated
  }

  async deleteDesignation(id: string, ctx: RequestContextDto) {
    this.logger.log(`Deleting designation ${id} for store ${ctx.storeId}`)
    const des = await this.hrmRepo.findDesignationById(id, ctx.storeId)
    if (!des) throw new NotFoundException('Designation not found')
    await this.hrmRepo.deleteDesignation(id)
    await this.auditLogService.log(ctx, {
      action: 'DELETE',
      entity: 'Designation',
      entityId: id,
      oldValue: des,
    })
    return { id }
  }
}
