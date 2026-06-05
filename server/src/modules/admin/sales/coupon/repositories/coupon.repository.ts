import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, ILike, Repository } from 'typeorm'
import { CouponEntity } from '../entities/coupon.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class CouponRepository {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly repo: Repository<CouponEntity>,
  ) {}

  /**
   * Atomically reserve one coupon usage slot.
   *
   *   UPDATE coupons SET used_count = used_count + 1
   *    WHERE id = $1 AND tenant_id = $2 AND is_active = true
   *      AND (usage_limit IS NULL OR used_count < usage_limit)
   *
   * Returns true iff exactly one row was updated. Used at order-commit time
   * to close the validate-then-increment race that allowed coupons to go
   * over their `usage_limit`.
   *
   * Always pass the order's transactional EntityManager so a later order
   * rollback rolls the counter back too.
   */
  async tryReserveUsage(id: string, tenantId: string, manager: EntityManager): Promise<boolean> {
    const repo = manager.getRepository(CouponEntity)
    const result = await repo
      .createQueryBuilder()
      .update(CouponEntity)
      .set({ usedCount: () => '"used_count" + 1' })
      .where('id = :id', { id })
      .andWhere('tenant_id = :tenantId', { tenantId })
      .andWhere('is_active = true')
      .andWhere('(usage_limit IS NULL OR used_count < usage_limit)')
      .andWhere('(start_date IS NULL OR start_date <= NOW())')
      .andWhere('(expiry_date IS NULL OR expiry_date > NOW())')
      .execute()
    return (result.affected ?? 0) > 0
  }

  /**
   * Inverse of `tryReserveUsage` — used to release a previously reserved
   * slot if a downstream step fails before the transaction commits.
   * (Optional safety net; rollback handles this automatically when the
   * reserve and the failure share a transaction.)
   */
  async releaseUsage(id: string, tenantId: string, manager: EntityManager): Promise<boolean> {
    const repo = manager.getRepository(CouponEntity)
    const result = await repo
      .createQueryBuilder()
      .update(CouponEntity)
      .set({ usedCount: () => 'GREATEST("used_count" - 1, 0)' })
      .where('id = :id', { id })
      .andWhere('tenant_id = :tenantId', { tenantId })
      .execute()
    return (result.affected ?? 0) > 0
  }

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
