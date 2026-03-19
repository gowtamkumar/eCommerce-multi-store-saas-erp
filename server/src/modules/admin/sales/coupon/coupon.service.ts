import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponEntity } from './entities/coupon.entity';
import { DiscountType } from '@/common/enums/discount-type.enum';

@Injectable()
export class CouponService {
    private readonly logger = new Logger(CouponService.name);

    constructor(
        @InjectRepository(CouponEntity)
        private couponRepository: Repository<CouponEntity>,
    ) { }

    async createCoupon(createCouponDto: CreateCouponDto, tenantId: string) {
        this.logger.log(`${this.createCoupon.name} Service Called`);
        const existing = await this.couponRepository.findOne({
            where: { code: ILike(createCouponDto.code), tenantId },
        });

        if (existing) {
            throw new BadRequestException('Coupon code already exists');
        }

        const coupon = this.couponRepository.create({
            ...createCouponDto,
            code: createCouponDto.code.toUpperCase(),
            tenantId,
        });

        return await this.couponRepository.save(coupon);
    }

    async findAllCoupons(filterDto: any, tenantId: string) {
        this.logger.log(`${this.findAllCoupons.name} Service Called`);
        const page = Math.max(1, parseInt(filterDto.page) || 1);
        const limit = Math.max(1, parseInt(filterDto.limit) || 10);
        const { search, isActive } = filterDto;

        const query = this.couponRepository.createQueryBuilder('coupon')
            .where('coupon.tenantId = :tenantId', { tenantId });

        if (isActive !== undefined) {
            query.andWhere('coupon.isActive = :isActive', { isActive: isActive === 'true' });
        }

        if (search) {
            query.andWhere('coupon.code ILIKE :search', { search: `%${search}%` });
        }

        const [coupons, total] = await query
            .orderBy('coupon.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { coupons, total };
    }

    async findOneCoupon(id: string, tenantId: string) {
        this.logger.log(`${this.findOneCoupon.name} Service Called`);
        const coupon = await this.couponRepository.findOne({
            where: { id, tenantId },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async findByCodeCoupon(code: string, tenantId: string) {
        this.logger.log(`${this.findByCodeCoupon.name} Service Called`);
        const coupon = await this.couponRepository.findOne({
            where: { code: ILike(code), tenantId },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async updateCoupon(id: string, updateCouponDto: UpdateCouponDto, tenantId: string) {
        this.logger.log(`${this.updateCoupon.name} Service Called`);
        const coupon = await this.findOneCoupon(id, tenantId);

        if (updateCouponDto.code && updateCouponDto.code.toUpperCase() !== coupon.code) {
            const existing = await this.couponRepository.findOne({
                where: { code: ILike(updateCouponDto.code), tenantId },
            });

            if (existing) {
                throw new BadRequestException('Coupon code already exists');
            }
        }

        if (updateCouponDto.code) {
            updateCouponDto.code = updateCouponDto.code.toUpperCase();
        }

        Object.assign(coupon, updateCouponDto);
        return await this.couponRepository.save(coupon);
    }

    async removeCoupon(id: string, tenantId: string) {
        this.logger.log(`${this.removeCoupon.name} Service Called`);
        const coupon = await this.findOneCoupon(id, tenantId);
        await this.couponRepository.remove(coupon);
        return { success: true, message: 'Coupon deleted successfully' };
    }

    async validateCoupon(code: string, orderTotal: number, tenantId: string) {
        this.logger.log(`${this.validateCoupon.name} Service Called`);
        try {
            const coupon = await this.findByCodeCoupon(code, tenantId);

            if (!coupon.isActive) {
                throw new BadRequestException('Coupon is inactive');
            }

            if (coupon.startDate && new Date() < coupon.startDate) {
                throw new BadRequestException('Coupon is not yet valid');
            }

            if (coupon.expiryDate && new Date() > coupon.expiryDate) {
                throw new BadRequestException('Coupon has expired');
            }

            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                throw new BadRequestException('Coupon usage limit reached');
            }

            if (coupon.minPurchaseAmount && orderTotal < coupon.minPurchaseAmount) {
                throw new BadRequestException(`Minimum purchase amount of ${coupon.minPurchaseAmount} required`);
            }

            // Calculate discount
            let discountAmount = 0;
            if (coupon.discountType === DiscountType.PERCENTAGE) {
                discountAmount = (orderTotal * Number(coupon.amount)) / 100;
            } else {
                discountAmount = Number(coupon.amount);
            }

            // Don't discount more than the order total
            discountAmount = Math.min(discountAmount, orderTotal);

            return {
                valid: true,
                coupon,
                discountAmount,
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new BadRequestException('Invalid coupon code');
            }
            throw error;
        }
    }

    async incrementUsage(id: string, tenantId: string) {
        this.logger.log(`${this.incrementUsage.name} Service Called`);
        const coupon = await this.findOneCoupon(id, tenantId);
        coupon.usedCount += 1;
        await this.couponRepository.save(coupon);
    }
}
