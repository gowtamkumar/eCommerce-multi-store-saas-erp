import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { ProductStatus } from 'src/common/enums/product-status.enum';
import { PromotionEntity } from './entities/promotion.entity';
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity';
import { PromotionTargetType } from './enums/promotion-target-type.enum';
import { PromotionType } from './enums/promotion-type.enum';

@Injectable()
export class PromotionService {
    private readonly logger = new Logger(PromotionService.name);

    constructor(
        @InjectRepository(PromotionEntity)
        private promotionRepository: Repository<PromotionEntity>,
        @InjectRepository(ProductEntity)
        private productRepository: Repository<ProductEntity>,
    ) { }

    async createPromotion(createPromotionDto: CreatePromotionDto, tenantId: string) {
        this.logger.log(`${this.createPromotion.name} Service Called`);
        const slug = createPromotionDto.slug || this.generateSlug(createPromotionDto.name);

        // Check if slug exists
        const existing = await this.promotionRepository.findOne({
            where: { slug, tenantId }
        });
        if (existing) {
            // If auto-generated, append timestamp to make unique
            if (!createPromotionDto.slug) {
                return this.createPromotion({ ...createPromotionDto, slug: `${slug}-${Date.now().toString().slice(-4)}` }, tenantId);
            }
            throw new ConflictException('Promotion with this slug already exists');
        }

        const promotion = this.promotionRepository.create({
            ...createPromotionDto,
            slug,
            tenantId,
        });
        return this.promotionRepository.save(promotion);
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
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

    async findOne(id: string, tenantId: string) {
        this.logger.log(`${this.findOne.name} Service Called`);
        const promotion = await this.promotionRepository.findOne({
            where: { id, tenantId },
        });

        if (!promotion) {
            throw new NotFoundException('Promotion not found');
        }

        return promotion;
    }

    async findOneBySlug(slug: string, tenantId: string) {
        this.logger.log(`${this.findOneBySlug.name} Service Called`);
        const promotion = await this.promotionRepository.findOne({
            where: { slug, tenantId },
        });
        if (!promotion) {
            throw new NotFoundException('Promotion not found');
        }
        return promotion;
    }

    async updatePromotion(id: string, updatePromotionDto: UpdatePromotionDto, tenantId: string) {
        this.logger.log(`${this.updatePromotion.name} Service Called`);
        const promotion = await this.findOne(id, tenantId);
        Object.assign(promotion, updatePromotionDto);
        return await this.promotionRepository.save(promotion);
    }

    async removePromotion(id: string, tenantId: string) {
        this.logger.log(`${this.removePromotion.name} Service Called`);
        const promotion = await this.findOne(id, tenantId);
        await this.promotionRepository.remove(promotion);
        return { success: true, message: 'Promotion deleted successfully' };
    }

    /**
     * Public endpoint: returns all active promotions with their applicable products.
     * Used by the customer storefront /offers page.
     */
    async getOfferProducts(tenantId: string) {
        this.logger.log(`${this.getOfferProducts.name} Service Called`);

        const now = new Date();

        // Fetch all active, non-expired promotions for this tenant
        const promotions = await this.promotionRepository
            .createQueryBuilder('promotion')
            .where('promotion.tenantId = :tenantId', { tenantId })
            .andWhere('promotion.isActive = true')
            .andWhere('(promotion.startDate IS NULL OR promotion.startDate <= :now)', { now })
            .andWhere('(promotion.endDate IS NULL OR promotion.endDate >= :now)', { now })
            .orderBy('promotion.createdAt', 'DESC')
            .getMany();

        if (!promotions.length) {
            return { promotions: [], offerGroups: [] };
        }

        const baseProductQuery = () =>
            this.productRepository.createQueryBuilder('product')
                .leftJoinAndSelect('product.category', 'category')
                .leftJoinAndSelect('product.brand', 'brand')
                .where('product.tenantId = :tenantId', { tenantId })
                .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
                .andWhere('product.stock > 0')
                .select([
                    'product.id', 'product.name', 'product.slug', 'product.price',
                    'product.discountAmount', 'product.images', 'product.shortDescription',
                    'product.stock', 'product.categoryId', 'product.brandId',
                    'category.id', 'category.name', 'category.slug',
                    'brand.id', 'brand.name',
                ]);

        const offerGroups: Array<{
            promotion: PromotionEntity;
            products: any[];
        }> = [];

        for (const promotion of promotions) {
            let products: any[] = [];

            if (promotion.targetType === PromotionTargetType.SPECIFIC_PRODUCT && promotion.targetId) {
                // Case 1: A single specific product
                const product = await baseProductQuery()
                    .andWhere('product.id = :id', { id: promotion.targetId })
                    .getOne();
                if (product) products = [product];

            } else if (promotion.targetType === PromotionTargetType.SPECIFIC_CATEGORY && promotion.targetId) {
                // Case 2: All active products in a specific category
                products = await baseProductQuery()
                    .andWhere('product.categoryId = :categoryId', { categoryId: promotion.targetId })
                    .take(20)
                    .getMany();

            } else if (promotion.targetType === PromotionTargetType.SPECIFIC_BRAND && promotion.targetId) {
                // Case 3: All active products of a specific brand
                products = await baseProductQuery()
                    .andWhere('product.brandId = :brandId', { brandId: promotion.targetId })
                    .take(20)
                    .getMany();

            } else if (
                promotion.targetType === PromotionTargetType.ENTIRE_ORDER ||
                promotion.targetType === PromotionTargetType.MINIMUM_CART_VALUE
            ) {
                // Case 4: Entire order / min cart — show the latest featured products
                products = await baseProductQuery()
                    .orderBy('product.createdAt', 'DESC')
                    .take(12)
                    .getMany();
            }

            // Attach computed promo discount to each product
            const enrichedProducts = products.map((p) => {
                const basePrice = Number(p.price);
                let promoDiscount = 0;

                if (promotion.promotionType === PromotionType.PERCENTAGE && promotion.value) {
                    promoDiscount = Math.round(basePrice * Number(promotion.value) / 100);
                } else if (promotion.promotionType === PromotionType.FIXED_AMOUNT && promotion.value) {
                    promoDiscount = Number(promotion.value);
                }

                const finalPrice = Math.max(0, basePrice - promoDiscount);

                return {
                    ...p,
                    promoDiscount,
                    promoDiscountPercentage: promotion.promotionType === PromotionType.PERCENTAGE
                        ? Number(promotion.value)
                        : basePrice > 0 ? Math.round((promoDiscount / basePrice) * 100) : 0,
                    finalPrice,
                    promotionId: promotion.id,
                    promotionName: promotion.name,
                    promotionType: promotion.promotionType,
                };
            });

            if (enrichedProducts.length > 0) {
                offerGroups.push({ promotion, products: enrichedProducts });
            }
        }

        return { promotions, offerGroups };
    }

    async getOfferProductsBySlug(slug: string, tenantId: string) {
        this.logger.log(`${this.getOfferProductsBySlug.name} Service Called`);
        const promotion = await this.findOneBySlug(slug, tenantId);

        const now = new Date();
        const isActive = promotion.isActive &&
            (!promotion.startDate || new Date(promotion.startDate) <= now) &&
            (!promotion.endDate || new Date(promotion.endDate) >= now);

        if (!isActive) {
            return { promotion, products: [] };
        }

        const products = await this.getProductsForPromotion(promotion, tenantId);

        const enrichedProducts = products.map((p) => {
            const basePrice = Number(p.price);
            let promoDiscount = 0;

            if (promotion.promotionType === PromotionType.PERCENTAGE && promotion.value) {
                promoDiscount = Math.round(basePrice * Number(promotion.value) / 100);
            } else if (promotion.promotionType === PromotionType.FIXED_AMOUNT && promotion.value) {
                promoDiscount = Number(promotion.value);
            }

            const finalPrice = Math.max(0, basePrice - promoDiscount);

            return {
                ...p,
                promoDiscount,
                promoDiscountPercentage: promotion.promotionType === PromotionType.PERCENTAGE
                    ? Number(promotion.value)
                    : basePrice > 0 ? Math.round((promoDiscount / basePrice) * 100) : 0,
                finalPrice,
                promotionId: promotion.id,
                promotionName: promotion.name,
                promotionType: promotion.promotionType,
            };
        });

        return { promotion, products: enrichedProducts };
    }

    private async getProductsForPromotion(promotion: PromotionEntity, tenantId: string) {
        const baseProductQuery = () =>
            this.productRepository.createQueryBuilder('product')
                .leftJoinAndSelect('product.category', 'category')
                .leftJoinAndSelect('product.brand', 'brand')
                .where('product.tenantId = :tenantId', { tenantId })
                .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
                .andWhere('product.stock > 0')
                .select([
                    'product.id', 'product.name', 'product.slug', 'product.price',
                    'product.discountAmount', 'product.images', 'product.shortDescription',
                    'product.stock', 'product.categoryId', 'product.brandId',
                    'category.id', 'category.name', 'category.slug',
                    'brand.id', 'brand.name',
                ]);

        if (promotion.targetType === PromotionTargetType.SPECIFIC_PRODUCT && promotion.targetId) {
            const product = await baseProductQuery()
                .andWhere('product.id = :id', { id: promotion.targetId })
                .getOne();
            return product ? [product] : [];
        } else if (promotion.targetType === PromotionTargetType.SPECIFIC_CATEGORY && promotion.targetId) {
            return await baseProductQuery()
                .andWhere('product.categoryId = :categoryId', { categoryId: promotion.targetId })
                .take(50)
                .getMany();
        } else if (promotion.targetType === PromotionTargetType.SPECIFIC_BRAND && promotion.targetId) {
            return await baseProductQuery()
                .andWhere('product.brandId = :brandId', { brandId: promotion.targetId })
                .take(50)
                .getMany();
        } else {
            return await baseProductQuery()
                .orderBy('product.createdAt', 'DESC')
                .take(24)
                .getMany();
        }
    }
}
