import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FaqStatus } from 'src/common/enums/faq-status.enum';
import { Repository } from 'typeorm';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FaqEntity } from './entities/faq.entity';

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

    // Find FAQs by Page ID
    async findByPage(pageId: string, tenantId: string) {
        return await this.faqRepository.find({
            where: { pageId, tenantId, status: FaqStatus.ACTIVE },
            order: { order: 'ASC', createdAt: 'DESC' }
        });
    }

    // Find Global FAQs (no productId or pageId)
    async findGlobalFaqs(tenantId: string) {
        return await this.faqRepository.find({
            where: { 
                tenantId, 
                productId: null, 
                pageId: null,
                status: FaqStatus.ACTIVE
            },
            order: { order: 'ASC', createdAt: 'DESC' }
        });
    }
}
