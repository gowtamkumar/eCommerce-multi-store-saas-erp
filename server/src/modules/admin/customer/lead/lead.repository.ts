import { BaseTenantRepository } from '@/common/base-repository'
import { LeadEntity } from '@/modules/admin/customer/lead/entities/lead.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class LeadRepository extends BaseTenantRepository<LeadEntity> {
  constructor(
    @InjectRepository(LeadEntity)
    repo: Repository<LeadEntity>,
  ) {
    super(LeadEntity, repo)
}

  async findAllWithFilters(
    filterDto: any,
    tenantId: string,
  ): Promise<{ leads: LeadEntity[]; total: number }> {
    const { page = 1, limit = 10, q, status } = filterDto
    const query = this.repo
      .createQueryBuilder('lead')
      .where('lead.tenantId = :tenantId', { tenantId })

    if (status) {
      query.andWhere('lead.status = :status', { status })
    }

    if (q) {
      query.andWhere('(lead.name ILIKE :q OR lead.email ILIKE :q)', { q: `%${q}%` })
    }

    const [leads, total] = await query
      .orderBy('lead.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { leads, total }
  }

  async findById(id: string, tenantId: string): Promise<LeadEntity | null> {
    return this.repo.findOne({ where: { id, tenantId } })
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<LeadEntity> {
    const lead = this.repo.create({
      ...dto,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as LeadEntity)
    return this.repo.save(lead)
  }

  async updateAndSave(lead: LeadEntity, dto: any): Promise<LeadEntity> {
    Object.assign(lead, dto)
    return this.repo.save(lead)
  }
}
