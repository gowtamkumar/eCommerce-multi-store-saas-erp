import { CreateLeadDto, UpdateLeadDto } from '@/modules/admin/customer/lead/dto/lead.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { LeadEntity } from './entities/lead.entity'
import { LeadRepository } from './lead.repository'

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name)

  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly cache: CacheService,
  ) {}

  async createLead(dto: CreateLeadDto, tenantId: string): Promise<LeadEntity> {
    this.logger.log(`${this.createLead.name} Service Called`)
    const lead = await this.leadRepository.createAndSave(dto, tenantId)
    await this.cache.delCache('leads:list', tenantId)
    return lead
  }

  async findAllLeads(
    filterDto: any,
    tenantId: string,
  ): Promise<{ leads: LeadEntity[]; total: number }> {
    this.logger.log(`${this.findAllLeads.name} Service Called`)
    const { page = 1, limit = 10, q = '', status = 'all' } = filterDto
    const cacheKey = `leads:list:p${page}:l${limit}:q${q}:s${status}`

    return this.cache.rememberCache(
      cacheKey,
      () => this.leadRepository.findAllWithFilters(filterDto, tenantId),
      300, // 5 min
      tenantId,
    )
  }

  async updateLead(id: string, dto: UpdateLeadDto, tenantId: string): Promise<LeadEntity> {
    this.logger.log(`${this.updateLead.name} Service Called`)
    const lead = await this.leadRepository.findById(id, tenantId)
    if (!lead) throw new NotFoundException('Lead not found')

    const updated = await this.leadRepository.updateAndSave(lead, dto)
    await this.cache.delCache('leads:list', tenantId)
    return updated
  }
}
