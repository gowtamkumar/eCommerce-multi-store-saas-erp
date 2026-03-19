import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum';
import { ProductEntity } from '@/modules/admin/product/entities/product.entity';
import { ProductVariantEntity } from '@/modules/admin/product/entities/variant.entity';
import { CreateInventoryTransactionDto } from '@/modules/admin/others/inventory-transaction/dto/create-inventory-transaction.dto';
import { InventoryTransactionEntity } from '@/modules/admin/others/inventory-transaction/entities/inventory-transaction.entity';

@Injectable()
export class InventoryTransactionService {
    private readonly logger = new Logger(InventoryTransactionService.name);

    constructor(
        @InjectRepository(InventoryTransactionEntity)
        private readonly repository: Repository<InventoryTransactionEntity>,
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(ProductVariantEntity)
        private readonly variantRepository: Repository<ProductVariantEntity>,
    ) { }

    async createInventoryTransaction(dto: CreateInventoryTransactionDto, tenantId: string, manager?: any) {
        this.logger.log(`${this.createInventoryTransaction.name} Service Called`);

        const productRepo = manager ? manager.getRepository(ProductEntity) : this.productRepository;
        const variantRepo = manager ? manager.getRepository(ProductVariantEntity) : this.variantRepository;
        const transactionRepo = manager ? manager.getRepository(InventoryTransactionEntity) : this.repository;

        const product = await productRepo.findOne({
            where: { id: dto.productId, tenantId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Update static stock fields (cache) atomically
        const isIncrement = dto.type !== InventoryTransactionType.OUT;
        const absQty = Math.abs(dto.quantity);

        if (dto.variantId) {
            const variant = await variantRepo.findOne({
                where: { id: dto.variantId, tenantId }
            });
            if (variant) {
                if (isIncrement) {
                    await variantRepo.increment({ id: variant.id, tenantId }, 'stock', absQty);
                } else {
                    await variantRepo.decrement({ id: variant.id, tenantId }, 'stock', absQty);
                }
            } else {
                throw new NotFoundException(`Variant with ID ${dto.variantId} not found`);
            }
        } else {
            if (isIncrement) {
                await productRepo.increment({ id: product.id, tenantId }, 'stock', absQty);
            } else {
                await productRepo.decrement({ id: product.id, tenantId }, 'stock', absQty);
            }
        }

        const transaction = transactionRepo.create({
            ...dto,
            tenantId,
        });

        return await transactionRepo.save(transaction);
    }

    async findAllInventoryTransactions(tenantId: string) {
        this.logger.log(`${this.findAllInventoryTransactions.name} Service Called`);
        return await this.repository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            relations: ['product'],
        });
    }

    async findByProductInventoryTransactions(productId: string, tenantId: string) {
        this.logger.log(`${this.findByProductInventoryTransactions.name} Service Called`);
        return await this.repository.find({
            where: { productId, tenantId },
            order: { createdAt: 'DESC' },
        });
    }

    async getStockSummaryInventoryTransactions(tenantId: string) {
        this.logger.log(`${this.getStockSummaryInventoryTransactions.name} Service Called`);
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
