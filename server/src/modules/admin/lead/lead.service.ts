import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeadDto, UpdateLeadDto } from '@/modules/admin/lead/dto/lead.dto';
import { LeadEntity } from '@/modules/admin/lead/entities/lead.entity';

@Injectable()
export class LeadService {
    private readonly logger = new Logger(LeadService.name);

    constructor(
        @InjectRepository(LeadEntity)
        private leadRepository: Repository<LeadEntity>,
    ) { }

    async createLead(dto: CreateLeadDto, tenantId: string) {
        this.logger.log(`${this.createLead.name} Service Called`);
        const lead = this.leadRepository.create({ ...dto, tenantId });
        return await this.leadRepository.save(lead);
    }

    async findAllLeads(filterDto: any, tenantId: string) {
        this.logger.log(`${this.findAllLeads.name} Service Called`);
        const { page, limit, q, status } = filterDto;
        const query = this.leadRepository.createQueryBuilder('lead')
            .where('lead.tenantId = :tenantId', { tenantId });

        if (status) {
            query.andWhere('lead.status = :status', { status });
        }

        if (q) {
            query.andWhere('(lead.name ILIKE :q OR lead.email ILIKE :q)', { q: `%${q}%` });
        }

        const [leads, total] = await query
            .orderBy('lead.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { leads, total };
    }

    async updateLead(id: string, dto: UpdateLeadDto, tenantId: string) {
        this.logger.log(`${this.updateLead.name} Service Called`);
        const lead = await this.leadRepository.findOne({ where: { id, tenantId } });
        if (!lead) throw new NotFoundException('Lead not found');
        Object.assign(lead, dto);
        return await this.leadRepository.save(lead);
    }
}
