import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { LeadEntity } from './entities/lead.entity';

@Injectable()
export class LeadService {
    constructor(
        @InjectRepository(LeadEntity)
        private leadRepository: Repository<LeadEntity>,
    ) { }

    async create(dto: CreateLeadDto, tenantId: string) {
        const lead = this.leadRepository.create({ ...dto, tenantId });
        return await this.leadRepository.save(lead);
    }

    async findAll(filterDto: any, tenantId: string) {
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

    async update(id: string, dto: UpdateLeadDto, tenantId: string) {
        const lead = await this.leadRepository.findOne({ where: { id, tenantId } });
        if (!lead) throw new NotFoundException('Lead not found');
        Object.assign(lead, dto);
        return await this.leadRepository.save(lead);
    }
}
