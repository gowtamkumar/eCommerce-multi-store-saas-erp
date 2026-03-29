import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateCouponDto } from './dto/create-coupon.dto'
import { UpdateCouponDto } from './dto/update-coupon.dto'
import { CouponRepository } from './coupon.repository'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { CouponEntity } from './entities/coupon.entity'

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name)

  constructor(private couponRepository: CouponRepository) {}

  async createCoupon(createCouponDto: CreateCouponDto, tenantId: string): Promise<CouponEntity> {
    this.logger.log(`${this.createCoupon.name} Service Called`)
    const existing = await this.couponRepository.findByCode(createCouponDto.code, tenantId)

    if (existing) {
      throw new BadRequestException('Coupon code already exists')
    }

    return await this.couponRepository.createAndSave(createCouponDto, tenantId)
  }

  async findAllCoupons(filterDto: any, tenantId: string): Promise<{ coupons: CouponEntity[], total: number }> {
    this.logger.log(`${this.findAllCoupons.name} Service Called`)
    const [coupons, total] = await this.couponRepository.findAllWithFilters(filterDto, tenantId)
    return { coupons, total }
  }

  async findOneCoupon(id: string, tenantId: string): Promise<CouponEntity> {
    this.logger.log(`${this.findOneCoupon.name} Service Called`)
    const coupon = await this.couponRepository.findById(id, tenantId)

    if (!coupon) {
      throw new NotFoundException('Coupon not found')
    }

    return coupon
  }

  async findByCodeCoupon(code: string, tenantId: string): Promise<CouponEntity> {
    this.logger.log(`${this.findByCodeCoupon.name} Service Called`)
    const coupon = await this.couponRepository.findByCode(code, tenantId)

    if (!coupon) {
      throw new NotFoundException('Coupon not found')
    }

    return coupon
  }

  async updateCoupon(id: string, updateCouponDto: UpdateCouponDto, tenantId: string): Promise<CouponEntity> {
    this.logger.log(`${this.updateCoupon.name} Service Called`)
    const coupon = await this.findOneCoupon(id, tenantId)

    if (updateCouponDto.code && updateCouponDto.code.toUpperCase() !== coupon.code) {
      const existing = await this.couponRepository.findByCode(updateCouponDto.code, tenantId)

      if (existing) {
        throw new BadRequestException('Coupon code already exists')
      }
    }

    return await this.couponRepository.updateAndSave(coupon, updateCouponDto)
  }

  async removeCoupon(id: string, tenantId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeCoupon.name} Service Called`)
    const coupon = await this.findOneCoupon(id, tenantId)
    await this.couponRepository.removeCoupon(coupon)
    return { success: true, message: 'Coupon deleted successfully' }
  }

  async validateCoupon(code: string, orderTotal: number, tenantId: string): Promise<{ valid: boolean; coupon: CouponEntity; discountAmount: number }> {
    this.logger.log(`${this.validateCoupon.name} Service Called`)
    try {
      const coupon = await this.findByCodeCoupon(code, tenantId)

      if (!coupon.isActive) {
        throw new BadRequestException('Coupon is inactive')
      }

      if (coupon.startDate && new Date() < coupon.startDate) {
        throw new BadRequestException('Coupon is not yet valid')
      }

      if (coupon.expiryDate && new Date() > coupon.expiryDate) {
        throw new BadRequestException('Coupon has expired')
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new BadRequestException('Coupon usage limit reached')
      }

      if (coupon.minPurchaseAmount && orderTotal < coupon.minPurchaseAmount) {
        throw new BadRequestException(
          `Minimum purchase amount of ${coupon.minPurchaseAmount} required`,
        )
      }

      // Calculate discount
      const couponDiscountStrategy = DiscountStrategyFactory.create(coupon.discountType as string)
      let discountAmount = couponDiscountStrategy.calculate(orderTotal, Number(coupon.amount))

      // Don't discount more than the order total
      discountAmount = Math.min(discountAmount, orderTotal)

      return {
        valid: true,
        coupon,
        discountAmount,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Invalid coupon code')
      }
      throw error
    }
  }

  async incrementUsage(id: string, tenantId: string): Promise<void> {
    this.logger.log(`${this.incrementUsage.name} Service Called`)
    const coupon = await this.findOneCoupon(id, tenantId)
    coupon.usedCount += 1
    await this.couponRepository.updateAndSave(coupon, {})
  }
}
