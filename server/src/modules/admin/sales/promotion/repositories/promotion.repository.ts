import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PromotionEntity } from '../entities/promotion.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PromotionRepository {
  constructor(
    @InjectRepository(PromotionEntity)
    private readonly repo: Repository<PromotionEntity>,
  ) {}

  async findActivePromotions(tenantId: string, now: Date): Promise<PromotionEntity[]> {
    return await this.repo
      .createQueryBuilder('promotion')
      .where('promotion.tenantId = :tenantId', { tenantId })
      .andWhere('promotion.isActive = true')
      .andWhere('(promotion.startDate IS NULL OR promotion.startDate <= :now)', { now })
      .andWhere('(promotion.endDate IS NULL OR promotion.endDate >= :now)', { now })
      .orderBy('promotion.createdAt', 'DESC')
      .getMany()
  }

  async findAllWithFilters(filterDto: any, tenantId: string): Promise<[PromotionEntity[], number]> {
    const page = Math.max(1, parseInt(filterDto.page) || 1)
    const limit = Math.max(1, parseInt(filterDto.limit) || 10)
    const { search, isActive } = filterDto

    const query = this.repo
      .createQueryBuilder('promotion')
      .where('promotion.tenantId = :tenantId', {
        tenantId,
      })

    if (isActive !== undefined) {
      query.andWhere('promotion.isActive = :isActive', { isActive: isActive === 'true' })
    }

    if (search) {
      query.andWhere('promotion.name ILIKE :search', { search: `%${search}%` })
    }

    return await query
      .orderBy('promotion.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
  }

  async findBySlug(slug: string, tenantId: string): Promise<PromotionEntity | null> {
    return await this.repo.findOne({
      where: { slug, tenantId },
    })
  }

  async findById(id: string, tenantId: string): Promise<PromotionEntity | null> {
    return await this.repo.findOne({
      where: { id, tenantId },
    })
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<PromotionEntity> {
    const promotion = this.repo.create({
      ...dto,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as PromotionEntity)
    return await this.repo.save(promotion)
  }

  async updateAndSave(promotion: PromotionEntity, dto: any): Promise<PromotionEntity> {
    Object.assign(promotion, dto)
    return await this.repo.save(promotion)
  }

  async removePromotion(promotion: PromotionEntity): Promise<void> {
    await this.repo.softRemove(promotion)
  }
}
