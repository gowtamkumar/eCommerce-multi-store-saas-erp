import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CouponEntity, DiscountType } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
    constructor(
        @InjectRepository(CouponEntity)
        private couponRepository: Repository<CouponEntity>,
    ) { }

    async create(createCouponDto: CreateCouponDto, tenantId: string) {
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

    async findAll(filterDto: any, tenantId: string) {
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

    async findOne(id: string, tenantId: string) {
        const coupon = await this.couponRepository.findOne({
            where: { id, tenantId },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async findByCode(code: string, tenantId: string) {
        const coupon = await this.couponRepository.findOne({
            where: { code: ILike(code), tenantId },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async update(id: string, updateCouponDto: UpdateCouponDto, tenantId: string) {
        const coupon = await this.findOne(id, tenantId);

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

    async remove(id: string, tenantId: string) {
        const coupon = await this.findOne(id, tenantId);
        await this.couponRepository.remove(coupon);
        return { success: true, message: 'Coupon deleted successfully' };
    }

    async validateCoupon(code: string, orderTotal: number, tenantId: string) {
        try {
            const coupon = await this.findByCode(code, tenantId);

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
        const coupon = await this.findOne(id, tenantId);
        coupon.usedCount += 1;
        await this.couponRepository.save(coupon);
    }
}
