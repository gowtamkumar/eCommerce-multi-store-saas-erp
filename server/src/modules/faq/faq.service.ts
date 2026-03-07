import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FaqStatus } from 'src/common/enums/faq-status.enum';
import { In, Repository } from 'typeorm';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FaqEntity } from './entities/faq.entity';

@Injectable()
export class FaqService {
    private readonly logger = new Logger(FaqService.name);

    constructor(
        @InjectRepository(FaqEntity)
        private faqRepository: Repository<FaqEntity>,
    ) { }

    async createFaq(createFaqDto: CreateFaqDto, tenantId: string) {
        this.logger.log(`${this.createFaq.name} Service Called`);
        const faq = this.faqRepository.create({ ...createFaqDto, tenantId });
        return await this.faqRepository.save(faq);
    }

    async findAllFaqs(filterDto: any, tenantId: string) {
        this.logger.log(`${this.findAllFaqs.name} Service Called`);
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

    async findOneFaq(id: string, tenantId: string) {
        this.logger.log(`${this.findOneFaq.name} Service Called`);
        const faq = await this.faqRepository.findOne({ where: { id, tenantId } });
        if (!faq) throw new NotFoundException('FAQ not found');
        return faq;
    }

    async updateFaq(id: string, updateFaqDto: UpdateFaqDto, tenantId: string) {
        this.logger.log(`${this.updateFaq.name} Service Called`);
        const faq = await this.findOneFaq(id, tenantId);
        Object.assign(faq, updateFaqDto);
        return await this.faqRepository.save(faq);
    }

    async removeFaq(id: string, tenantId: string) {
        this.logger.log(`${this.removeFaq.name} Service Called`);
        const faq = await this.findOneFaq(id, tenantId);
        await this.faqRepository.remove(faq);
        return { success: true };
    }

    // Find FAQs by Page ID
    async findByPageFaq(pageId: string, tenantId: string) {
        this.logger.log(`${this.findByPageFaq.name} Service Called`);
        return await this.faqRepository.find({
            where: { pageId, tenantId, status: FaqStatus.ACTIVE },
            order: { order: 'ASC', createdAt: 'DESC' }
        });
    }

    // Find Global FAQs (no productId or pageId)
    async findGlobalFaqs(tenantId: string) {
        this.logger.log(`${this.findGlobalFaqs.name} Service Called`);
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

    // Find FAQs by multiple IDs
    async findByIdsFaq(ids: string[], tenantId: string) {
        this.logger.log(`${this.findByIdsFaq.name} Service Called`);
        if (!ids || ids.length === 0) {
            return [];
        }

        return await this.faqRepository.find({
            where: {
                id: In(ids),
                tenantId,
                status: FaqStatus.ACTIVE
            },
            order: { order: 'ASC', createdAt: 'DESC' }
        });
    }
}
