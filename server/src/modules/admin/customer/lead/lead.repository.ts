import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { LeadEntity } from '@/modules/admin/customer/lead/entities/lead.entity'

@Injectable()
export class LeadRepository extends Repository<LeadEntity> {
  constructor(private dataSource: DataSource) {
    super(LeadEntity, dataSource.createEntityManager())
  }

  async findAllWithFilters(filterDto: any, tenantId: string): Promise<{ leads: LeadEntity[]; total: number }> {
    const { page = 1, limit = 10, q, status } = filterDto
    const query = this.createQueryBuilder('lead').where('lead.tenantId = :tenantId', { tenantId })

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
    return this.findOne({ where: { id, tenantId } })
  }

  async createAndSave(dto: any, tenantId: string): Promise<LeadEntity> {
    const lead = this.create({ ...dto, tenantId } as LeadEntity)
    return this.save(lead)
  }

  async updateAndSave(lead: LeadEntity, dto: any): Promise<LeadEntity> {
    Object.assign(lead, dto)
    return this.save(lead)
  }
}
