import { RequestContextDto } from '@/common/dto/request-context.dto'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateCouponDto } from '../dto/create-coupon.dto'
import { UpdateCouponDto } from '../dto/update-coupon.dto'
import { CouponEntity } from '../entities/coupon.entity'
import { CouponRepository } from '../repositoris/coupon.repository'

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name)

  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly cacheService: CacheService,
  ) { }

  async createCoupon(createCouponDto: CreateCouponDto, ctx: RequestContextDto): Promise<CouponEntity> {
    this.logger.log(`${this.createCoupon.name} Service Called`)
    const tenantId = ctx.tenantId
    const existing = await this.couponRepository.findByCode(createCouponDto.code, tenantId)
    if (existing) throw new BadRequestException('Coupon code already exists')

    const result = await this.couponRepository.createAndSave(createCouponDto, ctx)
    await this.cacheService.delCache('coupons:list', tenantId)
    return result
  }

  async findAllCoupons(
    filterDto: any,
    ctx: RequestContextDto,
  ): Promise<{ coupons: CouponEntity[]; total: number }> {
    this.logger.log(`${this.findAllCoupons.name} Service Called`)
    const tenantId = ctx.tenantId
    const { page = 1, limit = 10, search = '', isActive } = filterDto
    const cacheKey = `coupons:list:p${page}:l${limit}:q${search}:a${isActive ?? 'all'}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [coupons, total] = await this.couponRepository.findAllWithFilters(filterDto, tenantId)
        return { coupons, total }
      },
      300, // 5 min TTL
      tenantId,
    )
  }

  async findOneCoupon(id: string, ctx: RequestContextDto): Promise<CouponEntity> {
    this.logger.log(`${this.findOneCoupon.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `coupons:id:${id}`

    const coupon = await this.cacheService.rememberCache(
      cacheKey,
      () => this.couponRepository.findById(id, tenantId),
      600, // 10 min TTL
      tenantId,
    )

    if (!coupon) throw new NotFoundException('Coupon not found')
    return coupon
  }

  async findByCodeCoupon(code: string, ctx: RequestContextDto): Promise<CouponEntity> {
    this.logger.log(`${this.findByCodeCoupon.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `coupons:code:${code.toUpperCase()}`

    // Validate endpoint is hot-path — code lookups must be cached
    const coupon = await this.cacheService.rememberCache(
      cacheKey,
      () => this.couponRepository.findByCode(code, tenantId),
      600,
      tenantId,
    )

    if (!coupon) throw new NotFoundException('Coupon not found')
    return coupon
  }

  async updateCoupon(
    id: string,
    updateCouponDto: UpdateCouponDto,
    ctx: RequestContextDto,
  ): Promise<CouponEntity> {
    this.logger.log(`${this.updateCoupon.name} Service Called`)
    const tenantId = ctx.tenantId
    const coupon = await this.couponRepository.findById(id, tenantId)
    if (!coupon) throw new NotFoundException('Coupon not found')

    if (updateCouponDto.code && updateCouponDto.code.toUpperCase() !== coupon.code) {
      const existing = await this.couponRepository.findByCode(updateCouponDto.code, tenantId)
      if (existing) throw new BadRequestException('Coupon code already exists')
    }

    const result = await this.couponRepository.updateAndSave(coupon, updateCouponDto)
    // Invalidate all affected cache keys
    await Promise.all([
      this.cacheService.delCache('coupons:list', tenantId),
      this.cacheService.delCache(`coupons:id:${id}`, tenantId),
      this.cacheService.delCache(`coupons:code:${coupon.code}`, tenantId),
    ])
    return result
  }

  async removeCoupon(id: string, ctx: RequestContextDto): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeCoupon.name} Service Called`)
    const tenantId = ctx.tenantId
    const coupon = await this.couponRepository.findById(id, tenantId)
    if (!coupon) throw new NotFoundException('Coupon not found')

    await this.couponRepository.removeCoupon(coupon)
    await Promise.all([
      this.cacheService.delCache('coupons:list', tenantId),
      this.cacheService.delCache(`coupons:id:${id}`, tenantId),
      this.cacheService.delCache(`coupons:code:${coupon.code}`, tenantId),
    ])
    return { success: true, message: 'Coupon deleted successfully' }
  }

  async validateCoupon(
    code: string,
    orderTotal: number,
    ctx: RequestContextDto,
  ): Promise<{ valid: boolean; coupon: CouponEntity; discountAmount: number }> {
    this.logger.log(`${this.validateCoupon.name} Service Called`)
    const tenantId = ctx.tenantId
    try {
      const coupon = await this.findByCodeCoupon(code, ctx)

      if (!coupon.isActive) throw new BadRequestException('Coupon is inactive')
      if (coupon.startDate && new Date() < coupon.startDate) throw new BadRequestException('Coupon is not yet valid')
      if (coupon.expiryDate && new Date() > coupon.expiryDate) throw new BadRequestException('Coupon has expired')
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached')
      if (coupon.minPurchaseAmount && orderTotal < coupon.minPurchaseAmount) {
        throw new BadRequestException(`Minimum purchase amount of ${coupon.minPurchaseAmount} required`)
      }

      const strategy = DiscountStrategyFactory.create(coupon.discountType as string)
      const discountAmount = Math.min(strategy.calculate(orderTotal, Number(coupon.amount)), orderTotal)

      return { valid: true, coupon, discountAmount }
    } catch (error) {
      if (error instanceof NotFoundException) throw new BadRequestException('Invalid coupon code')
      throw error
    }
  }

  async incrementUsage(id: string, ctx: RequestContextDto): Promise<void> {
    this.logger.log(`${this.incrementUsage.name} Service Called`)
    const tenantId = ctx.tenantId
    const coupon = await this.couponRepository.findById(id, tenantId)
    if (!coupon) throw new NotFoundException('Coupon not found')
    coupon.usedCount += 1
    await this.couponRepository.updateAndSave(coupon, {})
    // Invalidate code-based cache so validate reflects the new usedCount
    await Promise.all([
      this.cacheService.delCache(`coupons:code:${coupon.code}`, tenantId),
      this.cacheService.delCache(`coupons:id:${id}`, tenantId),
    ])
  }
}
