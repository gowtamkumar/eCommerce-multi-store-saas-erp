import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { ReviewStatus } from '../../common/enums/review-status.enum';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(ReviewEntity)
        private reviewRepository: Repository<ReviewEntity>,
    ) { }

    async create(dto: CreateReviewDto, tenantId: string) {
        const review = this.reviewRepository.create({ ...dto, tenantId });
        return await this.reviewRepository.save(review);
    }

    async findAll(filterDto: any, tenantId: string) {
        const { page, limit, q, status } = filterDto;
        const query = this.reviewRepository.createQueryBuilder('review')
            .where('review.tenantId = :tenantId', { tenantId });

        if (status) {
            query.andWhere('review.status = :status', { status });
        }

        if (q) {
            query.andWhere('(review.reviewerName ILIKE :q OR review.content ILIKE :q)', { q: `%${q}%` });
        }

        const [reviews, total] = await query
            .orderBy('review.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { reviews, total };
    }

    async findPublic(tenantId: string) {
        return await this.reviewRepository.find({
            where: { tenantId, status: ReviewStatus.APPROVED },
            order: { createdAt: 'DESC' },
        });
    }

    async findByProduct(productId: string, tenantId: string) {
        return await this.reviewRepository.find({
            where: { productId, tenantId, status: ReviewStatus.APPROVED },
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: string, dto: UpdateReviewDto, tenantId: string) {
        const review = await this.reviewRepository.findOne({ where: { id, tenantId } });
        if (!review) throw new NotFoundException('Review not found');
        Object.assign(review, dto);
        return await this.reviewRepository.save(review);
    }

    async remove(id: string, tenantId: string) {
        const review = await this.reviewRepository.findOne({ where: { id, tenantId } });
        if (!review) throw new NotFoundException('Review not found');
        await this.reviewRepository.remove(review);
        return { success: true };
    }
}
