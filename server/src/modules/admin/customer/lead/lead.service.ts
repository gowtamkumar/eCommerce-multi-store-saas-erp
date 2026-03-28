import { CreateLeadDto, UpdateLeadDto } from '@/modules/admin/customer/lead/dto/lead.dto'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { LeadRepository } from './lead.repository'

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name)

  constructor(private readonly leadRepository: LeadRepository) {}

  async createLead(dto: CreateLeadDto, tenantId: string) {
    this.logger.log(`${this.createLead.name} Service Called`)
    return await this.leadRepository.createAndSave(dto, tenantId)
  }

  async findAllLeads(filterDto: any, tenantId: string) {
    this.logger.log(`${this.findAllLeads.name} Service Called`)
    return await this.leadRepository.findAllWithFilters(filterDto, tenantId)
  }

  async updateLead(id: string, dto: UpdateLeadDto, tenantId: string) {
    this.logger.log(`${this.updateLead.name} Service Called`)
    const lead = await this.leadRepository.findById(id, tenantId)
    if (!lead) throw new NotFoundException('Lead not found')

    return await this.leadRepository.updateAndSave(lead, dto)
  }
}
