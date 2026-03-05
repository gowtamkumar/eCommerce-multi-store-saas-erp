import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { ProductEntity } from '../../product/entities/product.entity';
import { ProductVariantEntity } from '../../product/entities/variant.entity';
import { InventoryTransactionType } from '../../../common/enums/inventory-transaction-type.enum';

@Injectable()
export class InventoryTransactionService {
    constructor(
        @InjectRepository(InventoryTransactionEntity)
        private readonly repository: Repository<InventoryTransactionEntity>,
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(ProductVariantEntity)
        private readonly variantRepository: Repository<ProductVariantEntity>,
    ) { }

    async create(dto: CreateInventoryTransactionDto, tenantId: string) {
        const product = await this.productRepository.findOne({
            where: { id: dto.productId, tenantId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Update static stock fields (cache) atomically
        const isIncrement = dto.type !== InventoryTransactionType.OUT;
        const absQty = Math.abs(dto.quantity);

        if (dto.variantId) {
            const variant = await this.variantRepository.findOne({
                where: { id: dto.variantId, tenantId }
            });
            if (variant) {
                if (isIncrement) {
                    await this.variantRepository.increment({ id: variant.id, tenantId }, 'stock', absQty);
                } else {
                    await this.variantRepository.decrement({ id: variant.id, tenantId }, 'stock', absQty);
                }
            } else {
                throw new NotFoundException(`Variant with ID ${dto.variantId} not found`);
            }
        } else {
            if (isIncrement) {
                await this.productRepository.increment({ id: product.id, tenantId }, 'stock', absQty);
            } else {
                await this.productRepository.decrement({ id: product.id, tenantId }, 'stock', absQty);
            }
        }

        const transaction = this.repository.create({
            ...dto,
            tenantId,
        });

        return await this.repository.save(transaction);
    }

    async findAll(tenantId: string) {
        return await this.repository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            relations: ['product'],
        });
    }

    async findByProduct(productId: string, tenantId: string) {
        return await this.repository.find({
            where: { productId, tenantId },
            order: { createdAt: 'DESC' },
        });
    }

    async getStockSummary(tenantId: string) {
        const products = await this.productRepository.find({
            where: { tenantId },
            relations: ['variants', 'category', 'supplier'],
            order: { createdAt: 'DESC' },
        });

        return products.map(product => {
            const hasVariants = product.variants && product.variants.length > 0;
            const totalStock = hasVariants
                ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                : product.stock;
            const totalValue = hasVariants
                ? product.variants.reduce((sum, v) => sum + (v.stock || 0) * Number(v.price || product.price), 0)
                : product.stock * Number(product.price);

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                images: product.images,
                price: product.price,
                status: product.status,
                categoryName: (product as any).category?.name || null,
                supplierName: (product as any).supplier?.name || null,
                hasVariants,
                stock: totalStock,
                stockValue: totalValue,
                variants: hasVariants ? product.variants.map(v => ({
                    id: v.id,
                    sku: v.sku,
                    combination: v.combination,
                    price: v.price || product.price,
                    stock: v.stock,
                })) : [],
                lowStock: totalStock <= 5 && totalStock > 0,
                outOfStock: totalStock === 0,
            };
        });
    }
}
