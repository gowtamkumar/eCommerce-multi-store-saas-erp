import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqEntity } from '../faq/entities/faq.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductAttributeEntity } from './entities/attribute.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductVariantEntity } from './entities/variant.entity';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private productRepository: Repository<ProductEntity>,
        @InjectRepository(FaqEntity)
        private faqRepository: Repository<FaqEntity>,
        @InjectRepository(ProductAttributeEntity)
        private attributeRepository: Repository<ProductAttributeEntity>,
        @InjectRepository(ProductVariantEntity)
        private variantRepository: Repository<ProductVariantEntity>,
    ) { }

    async create(createProductDto: CreateProductDto, tenantId: string) {
        // Check if slug exists for this tenant
        const existing = await this.productRepository.findOne({
            where: { slug: createProductDto.slug, tenantId },
        });

        if (existing) {
            throw new ConflictException('Product with this slug already exists');
        }

        const { faqs, attributes, variants, ...productData } = createProductDto;

        const product = this.productRepository.create({
            ...productData,
            tenantId,
        });

        const savedProduct = await this.productRepository.save(product);

        // Save FAQs
        if (faqs && faqs.length > 0) {
            const faqEntities = faqs.map(faq => this.faqRepository.create({
                ...faq,
                productId: savedProduct.id,
                tenantId,
            }));
            await this.faqRepository.save(faqEntities);
        }

        // Save Attributes
        if (attributes && attributes.length > 0) {
            const attributeEntities = attributes.map(attr => this.attributeRepository.create({
                ...attr,
                productId: savedProduct.id,
                tenantId,
            }));
            await this.attributeRepository.save(attributeEntities);
        }

        // Save Variants
        if (variants && variants.length > 0) {
            const variantEntities = variants.map(variant => this.variantRepository.create({
                ...variant,
                productId: savedProduct.id,
                tenantId,
            }));
            await this.variantRepository.save(variantEntities);
        }

        return await this.findOne(savedProduct.id, tenantId);
    }

    async findAll(filterDto: any, tenantId: string) {
        const { page, limit, q, status } = filterDto;
        const query = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.tenantId = :tenantId', { tenantId });

        if (status) {
            query.andWhere('product.status = :status', { status });
        }

        if (filterDto.categoryId) {
            query.andWhere('product.categoryId = :categoryId', { categoryId: filterDto.categoryId });
        }

        if (q) {
            query.andWhere('(product.name ILIKE :q OR product.description ILIKE :q)', { q: `%${q}%` });
        }

        const [products, total] = await query
            .orderBy('product.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { products, total };
    }

    async findLatest(tenantId: string, limit: number = 10) {
        return await this.productRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async findOne(id: string, tenantId: string) {
        const product = await this.productRepository.findOne({
            where: { id, tenantId },
            relations: ['faqs', 'attributes', 'variants', 'category'],
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async findBySlug(slug: string, tenantId: string) {
        const product = await this.productRepository.findOne({
            where: { slug, tenantId },
            relations: ['faqs', 'category'],
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto, tenantId: string) {
        const product = await this.findOne(id, tenantId);

        // If slug is being updated, check uniqueness
        if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
            const existing = await this.productRepository.findOne({
                where: { slug: updateProductDto.slug, tenantId },
            });

            if (existing) {
                throw new ConflictException('Product with this slug already exists');
            }
        }

        const { faqs, attributes, variants, ...productData } = updateProductDto;
        Object.assign(product, productData);
        await this.productRepository.save(product);

        // Sync FAQs
        if (faqs) {
            await this.faqRepository.delete({ productId: product.id, tenantId });
            if (faqs.length > 0) {
                const faqEntities = faqs.map(faq => this.faqRepository.create({
                    ...faq,
                    productId: product.id,
                    tenantId,
                }));
                await this.faqRepository.save(faqEntities);
            }
        }

        // Sync Attributes
        if (attributes) {
            await this.attributeRepository.delete({ productId: product.id, tenantId });
            if (attributes.length > 0) {
                const attributeEntities = attributes.map(attr => this.attributeRepository.create({
                    ...attr,
                    productId: product.id,
                    tenantId,
                }));
                await this.attributeRepository.save(attributeEntities);
            }
        }

        // Sync Variants
        if (variants) {
            await this.variantRepository.delete({ productId: product.id, tenantId });
            if (variants.length > 0) {
                const variantEntities = variants.map(variant => this.variantRepository.create({
                    ...variant,
                    productId: product.id,
                    tenantId,
                }));
                await this.variantRepository.save(variantEntities);
            }
        }

        return await this.findOne(id, tenantId);
    }

    async remove(id: string, tenantId: string) {
        const product = await this.findOne(id, tenantId);
        await this.productRepository.remove(product);
        return { success: true, message: 'Product deleted successfully' };
    }

    async decrementStock(productId: string, quantity: number, tenantId: string, variantId?: string) {
        if (variantId) {
            const variant = await this.variantRepository.findOne({
                where: { id: variantId, productId, tenantId },
            });

            if (!variant) {
                throw new NotFoundException('Product variant not found');
            }

            if (variant.stock < quantity) {
                throw new ConflictException('Insufficient variant stock');
            }

            variant.stock -= quantity;
            return await this.variantRepository.save(variant);
        }

        const product = await this.findOne(productId, tenantId);

        if (product.stock < quantity) {
            throw new ConflictException('Insufficient stock');
        }

        product.stock -= quantity;
        return await this.productRepository.save(product);
    }
}
