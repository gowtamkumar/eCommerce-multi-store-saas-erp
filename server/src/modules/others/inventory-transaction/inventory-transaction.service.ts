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

        // Update static stock fields (cache)
        const qtyChange = dto.type === InventoryTransactionType.OUT ? -dto.quantity : dto.quantity;

        if (dto.variantId) {
            const variant = await this.variantRepository.findOne({
                where: { id: dto.variantId, productId: dto.productId, tenantId }
            });
            if (variant) {
                variant.stock = (variant.stock || 0) + qtyChange;
                await this.variantRepository.save(variant);
            }
        } else {
            product.stock = (product.stock || 0) + qtyChange;
            await this.productRepository.save(product);
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
}
