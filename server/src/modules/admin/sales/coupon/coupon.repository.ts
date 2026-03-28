import { Injectable } from '@nestjs/common'
import { DataSource, ILike, Repository } from 'typeorm'
import { CouponEntity } from './entities/coupon.entity'

@Injectable()
export class CouponRepository extends Repository<CouponEntity> {
  constructor(private dataSource: DataSource) {
    super(CouponEntity, dataSource.createEntityManager())
  }

  async findByCode(code: string, tenantId: string): Promise<CouponEntity | null> {
    return await this.findOne({
      where: { code: ILike(code), tenantId },
    })
  }

  async findById(id: string, tenantId: string): Promise<CouponEntity | null> {
    return await this.findOne({
      where: { id, tenantId },
    })
  }

  async findAllWithFilters(filterDto: any, tenantId: string): Promise<[CouponEntity[], number]> {
    const page = Math.max(1, parseInt(filterDto.page) || 1)
    const limit = Math.max(1, parseInt(filterDto.limit) || 10)
    const { search, isActive } = filterDto

    const query = this.createQueryBuilder('coupon').where('coupon.tenantId = :tenantId', {
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

  async createAndSave(dto: any, tenantId: string): Promise<CouponEntity> {
    const coupon = this.create({
      ...dto,
      code: dto.code.toUpperCase(),
      tenantId,
    } as any) as unknown as CouponEntity
    return await (this.save(coupon) as Promise<CouponEntity>)
  }

  async updateAndSave(coupon: CouponEntity, dto: any): Promise<CouponEntity> {
    if (dto.code) {
      dto.code = dto.code.toUpperCase()
    }
    Object.assign(coupon, dto)
    return await this.save(coupon)
  }

  async removeCoupon(coupon: CouponEntity): Promise<void> {
    await this.remove(coupon)
  }
}
