import { CreateLeadDto, UpdateLeadDto } from '@/modules/admin/customer/lead/dto/lead.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { LeadEntity } from './entities/lead.entity'
import { LeadRepository } from './lead.repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name)

  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly cache: CacheService,
    private readonly notificationService: NotificationService,
  ) {}

  async createLead(dto: CreateLeadDto, ctx: RequestContextDto): Promise<LeadEntity> {
    this.logger.log(`${this.createLead.name} Service Called`)
    const storeId = ctx.storeId
    const lead = await this.leadRepository.createAndSave(dto, ctx)

    // Trigger New Lead Notification
    try {
      await this.notificationService.createNotification(
        {
          title: 'New Lead Generated',
          message: `New lead "${lead.name || lead.email}" generated from Website.`,
          type: 'SUCCESS',
          link: `/admin/leads`,
          userId: null as any, // Send to all admins
        },
        storeId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger new lead notification: ${e.message}`)
    }

    await this.cache.delCacheByPattern('leads:list*', storeId)
    return lead
  }

  async findAllLeads(
    filterDto: any,
    ctx: RequestContextDto,
  ): Promise<{ leads: LeadEntity[]; total: number }> {
    this.logger.log(`${this.findAllLeads.name} Service Called`)
    const storeId = ctx.storeId
    const { page = 1, limit = 10, q = '', status = 'all' } = filterDto
    const cacheKey = `leads:list:p${page}:l${limit}:q${q}:s${status}`

    return this.cache.rememberCache(
      cacheKey,
      () => this.leadRepository.findAllWithFilters(filterDto, storeId),
      300, // 5 min
      storeId,
    )
  }

  async updateLead(id: string, dto: UpdateLeadDto, ctx: RequestContextDto): Promise<LeadEntity> {
    this.logger.log(`${this.updateLead.name} Service Called`)
    const storeId = ctx.storeId
    const lead = await this.leadRepository.findById(id, storeId)
    if (!lead) throw new NotFoundException('Lead not found')

    const updated = await this.leadRepository.updateAndSave(lead, dto)
    await this.cache.delCacheByPattern('leads:list*', storeId)
    return updated
  }
}
