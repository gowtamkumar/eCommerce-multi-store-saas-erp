import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionEntity } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionService {
    constructor(
        @InjectRepository(PromotionEntity)
        private promotionRepository: Repository<PromotionEntity>,
    ) { }

    async create(createPromotionDto: CreatePromotionDto, tenantId: string) {
        const promotion = this.promotionRepository.create({
            ...createPromotionDto,
            tenantId,
        });
        return await this.promotionRepository.save(promotion);
    }

    async findAll(filterDto: any, tenantId: string) {
        const page = Math.max(1, parseInt(filterDto.page) || 1);
        const limit = Math.max(1, parseInt(filterDto.limit) || 10);
        const { search, isActive } = filterDto;

        const query = this.promotionRepository.createQueryBuilder('promotion')
            .where('promotion.tenantId = :tenantId', { tenantId });

        if (isActive !== undefined) {
            query.andWhere('promotion.isActive = :isActive', { isActive: isActive === 'true' });
        }

        if (search) {
            query.andWhere('promotion.name ILIKE :search', { search: `%${search}%` });
        }

        const [promotions, total] = await query
            .orderBy('promotion.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { promotions, total };
    }

    async findActivePromotions(tenantId: string) {
        return await this.promotionRepository.find({
            where: {
                tenantId,
                isActive: true,
            },
        });
    }

    async findOne(id: string, tenantId: string) {
        const promotion = await this.promotionRepository.findOne({
            where: { id, tenantId },
        });

        if (!promotion) {
            throw new NotFoundException('Promotion not found');
        }

        return promotion;
    }

    async update(id: string, updatePromotionDto: UpdatePromotionDto, tenantId: string) {
        const promotion = await this.findOne(id, tenantId);
        Object.assign(promotion, updatePromotionDto);
        return await this.promotionRepository.save(promotion);
    }

    async remove(id: string, tenantId: string) {
        const promotion = await this.findOne(id, tenantId);
        await this.promotionRepository.remove(promotion);
        return { success: true, message: 'Promotion deleted successfully' };
    }
}
