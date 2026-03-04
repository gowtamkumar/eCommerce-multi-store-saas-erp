import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { ProductEntity } from '../../product/entities/product.entity';

@Injectable()
export class InventoryTransactionService {
    constructor(
        @InjectRepository(InventoryTransactionEntity)
        private readonly repository: Repository<InventoryTransactionEntity>,
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) { }

    async create(dto: CreateInventoryTransactionDto, tenantId: string) {
        const product = await this.productRepository.findOne({
            where: { id: dto.productId, tenantId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const transaction = this.repository.create({
            ...dto,
            tenantId,
        });

        const savedTransaction = await this.repository.save(transaction);

        // Update product stock
        if (dto.type === 'IN') {
            product.stock += dto.quantity;
        } else {
            product.stock -= dto.quantity;
        }
        await this.productRepository.save(product);

        return savedTransaction;
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
