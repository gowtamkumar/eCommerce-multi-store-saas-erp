import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private productRepository: Repository<ProductEntity>,
    ) { }

    async create(createProductDto: CreateProductDto, tenantId: string) {
        // Check if slug exists for this tenant
        const existing = await this.productRepository.findOne({
            where: { slug: createProductDto.slug, tenantId },
        });

        if (existing) {
            throw new ConflictException('Product with this slug already exists');
        }

        const product = this.productRepository.create({
            ...createProductDto,
            tenantId,
        });

        return await this.productRepository.save(product);
    }

    async findAll(filterDto: any, tenantId: string) {
        const { page, limit, q, status } = filterDto;
        const query = this.productRepository.createQueryBuilder('product')
            .where('product.tenantId = :tenantId', { tenantId });

        if (status) {
            query.andWhere('product.status = :status', { status });
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
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async findBySlug(slug: string, tenantId: string) {
        const product = await this.productRepository.findOne({
            where: { slug, tenantId },
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

        Object.assign(product, updateProductDto);
        return await this.productRepository.save(product);
    }

    async remove(id: string, tenantId: string) {
        const product = await this.findOne(id, tenantId);
        await this.productRepository.remove(product);
        return { success: true, message: 'Product deleted successfully' };
    }

    async decrementStock(productId: string, quantity: number, tenantId: string) {
        const product = await this.findOne(productId, tenantId);

        if (product.stock < quantity) {
            throw new ConflictException('Insufficient stock');
        }

        product.stock -= quantity;
        return await this.productRepository.save(product);
    }
}
