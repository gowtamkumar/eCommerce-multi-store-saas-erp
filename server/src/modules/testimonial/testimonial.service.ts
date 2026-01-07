import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestimonialEntity } from './entities/testimonial.entity';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';

@Injectable()
export class TestimonialService {
    constructor(
        @InjectRepository(TestimonialEntity)
        private testimonialRepository: Repository<TestimonialEntity>,
    ) { }

    async create(dto: CreateTestimonialDto, tenantId: string) {
        const testimonial = this.testimonialRepository.create({ ...dto, tenantId });
        return await this.testimonialRepository.save(testimonial);
    }

    async findAll(filterDto: any, tenantId: string) {
        const { page, limit, q, status } = filterDto;
        const query = this.testimonialRepository.createQueryBuilder('testimonial')
            .where('testimonial.tenantId = :tenantId', { tenantId });

        if (status) {
            query.andWhere('testimonial.status = :status', { status });
        }

        if (q) {
            query.andWhere('(testimonial.authorName ILIKE :q OR testimonial.content ILIKE :q)', { q: `%${q}%` });
        }

        const [testimonials, total] = await query
            .orderBy('testimonial.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { testimonials, total };
    }

    async update(id: string, dto: UpdateTestimonialDto, tenantId: string) {
        const testimonial = await this.testimonialRepository.findOne({ where: { id, tenantId } });
        if (!testimonial) throw new NotFoundException('Testimonial not found');
        Object.assign(testimonial, dto);
        return await this.testimonialRepository.save(testimonial);
    }

    async remove(id: string, tenantId: string) {
        const testimonial = await this.testimonialRepository.findOne({ where: { id, tenantId } });
        if (!testimonial) throw new NotFoundException('Testimonial not found');
        await this.testimonialRepository.remove(testimonial);
        return { success: true };
    }
}
