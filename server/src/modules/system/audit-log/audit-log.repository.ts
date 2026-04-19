import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, FindOptionsWhere, Repository } from 'typeorm'
import { AuditLogEntity } from './entities/audit-log.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) { }

  async createAndSave(ctx: RequestContextDto, data: any): Promise<void> {
    const entry = this.repo.create({
      ...data,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    })
    await this.repo.save(entry)
  }

  async findAllWithFilters(
    tenantId: string,
    filters: {
      page: number
      limit: number
      userId?: string
      action?: string
      entity?: string
      entityId?: string
      from?: string
      to?: string
    },
  ): Promise<[AuditLogEntity[], number]> {
    const { page, limit, userId, action, entity, entityId, from, to } = filters
    const where: FindOptionsWhere<AuditLogEntity> = { tenantId }

    if (userId) where.userId = userId
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

  async findById(id: string, tenantId: string): Promise<AuditLogEntity | null> {
    return await this.repo.findOne({ where: { id, tenantId } })
  }

  async deleteOlderThan(tenantId: string, cutoff: Date): Promise<void> {
    await this.repo.createQueryBuilder()
      .delete()
      .from(AuditLogEntity)
      .where('tenant_id = :tenantId', { tenantId })
      .andWhere('created_at < :cutoff', { cutoff })
      .execute()
  }

}
