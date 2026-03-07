import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionEntity } from './entities/promotion.entity';

@Injectable()
export class PromotionService {
    private readonly logger = new Logger(PromotionService.name);

    constructor(
        @InjectRepository(PromotionEntity)
        private promotionRepository: Repository<PromotionEntity>,
    ) { }

    async createPromotion(createPromotionDto: CreatePromotionDto, tenantId: string) {
        this.logger.log(`${this.createPromotion.name} Service Called`);
        const promotion = this.promotionRepository.create({
            ...createPromotionDto,
            tenantId,
        });
        return await this.promotionRepository.save(promotion);
    }

    async findAllPromotions(filterDto: any, tenantId: string) {
        this.logger.log(`${this.findAllPromotions.name} Service Called`);
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
        this.logger.log(`${this.findActivePromotions.name} Service Called`);
        return await this.promotionRepository.find({
            where: {
                tenantId,
                isActive: true,
            },
        });
    }

    async findOnePromotion(id: string, tenantId: string) {
        this.logger.log(`${this.findOnePromotion.name} Service Called`);
        const promotion = await this.promotionRepository.findOne({
            where: { id, tenantId },
        });

        if (!promotion) {
            throw new NotFoundException('Promotion not found');
        }

        return promotion;
    }

    async updatePromotion(id: string, updatePromotionDto: UpdatePromotionDto, tenantId: string) {
        this.logger.log(`${this.updatePromotion.name} Service Called`);
        const promotion = await this.findOnePromotion(id, tenantId);
        Object.assign(promotion, updatePromotionDto);
        return await this.promotionRepository.save(promotion);
    }

    async removePromotion(id: string, tenantId: string) {
        this.logger.log(`${this.removePromotion.name} Service Called`);
        const promotion = await this.findOnePromotion(id, tenantId);
        await this.promotionRepository.remove(promotion);
        return { success: true, message: 'Promotion deleted successfully' };
    }
}
