import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, FindOptionsWhere, Repository, ILike } from 'typeorm'
import { AuditLogEntity } from './entities/audit-log.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  async createAndSave(ctx: RequestContextDto, data: any): Promise<void> {
    const entry = this.repo.create({
      ...data,
      tenantId: ctx.tenantId,
      actorId: data.actorId ?? data.userId ?? ctx.userId ?? null,
      branchId: ctx.branchId || data.branchId || null,
      warehouseId: ctx.warehouseId || data.warehouseId || null,
    })
    await this.repo.save(entry)
  }

  async findAllWithFilters(
    tenantId: string | null,
    filters: {
      page: number
      limit: number
      userId?: string
      branchId?: string
      warehouseId?: string
      action?: string
      entity?: string
      entityId?: string
      from?: string
      to?: string
    },
  ): Promise<[AuditLogEntity[], number]> {
    const { page, limit, userId, branchId, warehouseId, action, entity, entityId, from, to } =
      filters
    const where: FindOptionsWhere<AuditLogEntity> = {}

    if (tenantId) {
      where.tenantId = tenantId
    }

    if (userId) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
      if (isUuid) {
        where.actorId = userId
      } else {
        where.actorName = ILike(`%${userId}%`)
      }
    }
    if (branchId) where.branchId = branchId
    if (warehouseId) where.warehouseId = warehouseId
    if (action) where.action = action
    if (entity) where.entity = entity
    if (entityId) where.entityId = entityId

    if (from && to) {
      where.createdAt = Between(new Date(from), new Date(to))
    }

    return await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  async findById(id: string, tenantId: string | null): Promise<AuditLogEntity | null> {
    const where: FindOptionsWhere<AuditLogEntity> = { id }
    if (tenantId) {
      where.tenantId = tenantId
    }
    return await this.repo.findOne({ where })
  }

  async deleteOlderThan(tenantId: string, cutoff: Date): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .delete()
      .from(AuditLogEntity)
      .where('tenant_id = :tenantId', { tenantId })
      .andWhere('created_at < :cutoff', { cutoff })
      .execute()
  }
}
