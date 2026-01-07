import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqEntity } from './entities/faq.entity';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqService {
    constructor(
        @InjectRepository(FaqEntity)
        private faqRepository: Repository<FaqEntity>,
    ) { }

    async create(createFaqDto: CreateFaqDto, tenantId: string) {
        const faq = this.faqRepository.create({ ...createFaqDto, tenantId });
        return await this.faqRepository.save(faq);
    }

    async findAll(filterDto: any, tenantId: string) {
        const { page, limit, q, status } = filterDto;
        const query = this.faqRepository.createQueryBuilder('faq')
            .where('faq.tenantId = :tenantId', { tenantId });

        if (status) {
            query.andWhere('faq.status = :status', { status });
        }

        if (q) {
            query.andWhere('(faq.question ILIKE :q OR faq.answer ILIKE :q)', { q: `%${q}%` });
        }

        const [faqs, total] = await query
            .orderBy('faq.order', 'ASC')
            .addOrderBy('faq.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { faqs, total };
    }

    async findOne(id: string, tenantId: string) {
        const faq = await this.faqRepository.findOne({ where: { id, tenantId } });
        if (!faq) throw new NotFoundException('FAQ not found');
        return faq;
    }

    async update(id: string, updateFaqDto: UpdateFaqDto, tenantId: string) {
        const faq = await this.findOne(id, tenantId);
        Object.assign(faq, updateFaqDto);
        return await this.faqRepository.save(faq);
    }

    async remove(id: string, tenantId: string) {
        const faq = await this.findOne(id, tenantId);
        await this.faqRepository.remove(faq);
        return { success: true };
    }
}
