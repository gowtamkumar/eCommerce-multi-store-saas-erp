import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { CouponEntity } from '../entities/coupon.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class CouponRepository {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly repo: Repository<CouponEntity>,
  ) {}

  async findByCode(code: string, tenantId: string): Promise<CouponEntity | null> {
    return await this.repo.findOne({
      where: { code: ILike(code), tenantId },
    })
  }

  async findById(id: string, tenantId: string): Promise<CouponEntity | null> {
    return await this.repo.findOne({
      where: { id, tenantId },
    })
  }

  async findAllWithFilters(filterDto: any, tenantId: string): Promise<[CouponEntity[], number]> {
    const page = Math.max(1, parseInt(filterDto.page) || 1)
    const limit = Math.max(1, parseInt(filterDto.limit) || 10)
    const { search, isActive } = filterDto

    const query = this.repo.createQueryBuilder('coupon').where('coupon.tenantId = :tenantId', {
      tenantId,
    })

    if (isActive !== undefined) {
      query.andWhere('coupon.isActive = :isActive', { isActive: isActive === 'true' })
    }

    if (search) {
      query.andWhere('coupon.code ILIKE :search', { search: `%${search}%` })
    }

    return await query
      .orderBy('coupon.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<CouponEntity> {
    const coupon = this.repo.create({
      ...dto,
      code: dto.code.toUpperCase(),
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as any) as unknown as CouponEntity
    return await (this.repo.save(coupon) as Promise<CouponEntity>)
  }

  async updateAndSave(coupon: CouponEntity, dto: any): Promise<CouponEntity> {
    if (dto.code) {
      dto.code = dto.code.toUpperCase()
    }
    Object.assign(coupon, dto)
    return await this.repo.save(coupon)
  }

  async removeCoupon(coupon: CouponEntity): Promise<void> {
    await this.repo.softRemove(coupon)
  }
}
